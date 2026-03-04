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

        // Формируем URL для TonAPI с фильтром по коллекции
        const apiUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(wallet)}/nfts?collection=${encodeURIComponent(collection)}&limit=1000&offset=0&indirect_ownership=false`;
        
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
                error: 'Ошибка при загрузке NFT коллекции',
                details: error.message 
            })
        };
    }
};