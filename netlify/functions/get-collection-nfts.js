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
        const wallet = event.queryStringParameters?.wallet;
        const collection = event.queryStringParameters?.collection;
        
        if (!wallet || !collection) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Не указан кошелек или коллекция' })
            };
        }

        // Получаем API-ключ из переменных окружения Netlify
        const TONAPI_KEY = process.env.TONAPI_KEY;
        
        if (!TONAPI_KEY) {
            console.error('TONAPI_KEY not set in environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Формируем URL с API-ключом
        const apiUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(wallet)}/nfts?collection=${encodeURIComponent(collection)}&limit=1000&offset=0&indirect_ownership=false&api_key=${TONAPI_KEY}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Пробуем через Authorization header
            if (response.status === 401 || response.status === 403) {
                console.log('Retrying with Authorization header...');
                const altUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(wallet)}/nfts?collection=${encodeURIComponent(collection)}&limit=1000&offset=0&indirect_ownership=false`;
                const altResponse = await fetch(altUrl, {
                    headers: {
                        'Authorization': `Bearer ${TONAPI_KEY}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!altResponse.ok) {
                    throw new Error(`TonAPI ответил статусом ${altResponse.status}`);
                }
                
                const altData = await altResponse.json();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(altData)
                };
            }
            
            throw new Error(`TonAPI ответил статусом ${response.status}`);
        }

        const data = await response.json();
        
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
                error: 'Ошибка при загрузке NFT коллекции',
                details: error.message 
            })
        };
    }
};