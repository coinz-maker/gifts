exports.handler = async function(event, context) {
    const TONAPI_KEY = process.env.TONAPI_KEY;
    const testAddress = '0:bc02182c000b10ed8e46d605431697f291f44d03dc1b271b175c4408b9336a45';
    
    const results = [];
    
    // Тест 1: ключ в query
    try {
        const url1 = `https://tonapi.io/v2/accounts/${testAddress}/nfts?limit=1&api_key=${TONAPI_KEY}`;
        const res1 = await fetch(url1);
        results.push({
            method: 'query_param',
            status: res1.status,
            ok: res1.ok
        });
    } catch (e) {
        results.push({ method: 'query_param', error: e.message });
    }
    
    // Тест 2: ключ в header
    try {
        const url2 = `https://tonapi.io/v2/accounts/${testAddress}/nfts?limit=1`;
        const res2 = await fetch(url2, {
            headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
        });
        results.push({
            method: 'auth_header',
            status: res2.status,
            ok: res2.ok
        });
    } catch (e) {
        results.push({ method: 'auth_header', error: e.message });
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            keyExists: !!TONAPI_KEY,
            keyLength: TONAPI_KEY ? TONAPI_KEY.length : 0,
            tests: results
        }, null, 2)
    };
};