exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const address = event.queryStringParameters?.address;
        // Получаем ключ из query параметра ИЛИ из переменных окружения
        const apiKeyFromQuery = event.queryStringParameters?.api_key;
        const TONAPI_KEY = process.env.TONAPI_KEY || apiKeyFromQuery;
        
        console.log('Debug:', { 
            address: address ? address.substring(0, 10) + '...' : null,
            hasApiKey: !!TONAPI_KEY,
            keySource: TONAPI_KEY ? (TONAPI_KEY === apiKeyFromQuery ? 'query' : 'env') : 'none'
        });

        if (!address) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Не указан адрес кошелька' })
            };
        }

        if (!TONAPI_KEY) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Пробуем разные способы передачи ключа
        let data = null;
        let lastError = null;

        // Способ 1: ключ в query параметре
        try {
            const urlWithQueryKey = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}/nfts?limit=1000&offset=0&api_key=${TONAPI_KEY}`;
            const response = await fetch(urlWithQueryKey, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                data = await response.json();
            } else {
                lastError = `Query param method failed: ${response.status}`;
            }
        } catch (e) {
            lastError = `Query param method error: ${e.message}`;
        }

        // Способ 2: если первый не сработал, пробуем через Authorization header
        if (!data) {
            try {
                const url = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}/nfts?limit=1000&offset=0`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${TONAPI_KEY}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                } else {
                    lastError = `Auth header method failed: ${response.status}`;
                }
            } catch (e) {
                lastError = `Auth header method error: ${e.message}`;
            }
        }

        if (!data) {
            throw new Error(`All authentication methods failed. Last error: ${lastError}`);
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('Function error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Ошибка при загрузке NFT',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};