exports.handler = async function(event, context) {
    // Разрешаем CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Обработка preflight запросов (OPTIONS)
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

        // Формируем URL для TonAPI
        const apiUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}/nfts?limit=1000&offset=0`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
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