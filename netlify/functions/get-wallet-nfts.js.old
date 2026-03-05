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
        
        if (!address) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Не указан адрес кошелька' })
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

        // Формируем URL с API-ключом в query параметре
        const apiUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}/nfts?limit=1000&offset=0&api_key=${TONAPI_KEY}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Пробуем другой способ: через заголовок Authorization
            if (response.status === 401 || response.status === 403) {
                console.log('Retrying with Authorization header...');
                const altResponse = await fetch(`https://tonapi.io/v2/accounts/${encodeURIComponent(address)}/nfts?limit=1000&offset=0`, {
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
                error: 'Ошибка при загрузке NFT',
                details: error.message 
            })
        };
    }
};