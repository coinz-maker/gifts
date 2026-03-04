exports.handler = async function() {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            keyExists: !!process.env.TONAPI_KEY,
            keyValue: process.env.TONAPI_KEY ? process.env.TONAPI_KEY.substring(0, 3) + '...' : null,
            allEnvKeys: Object.keys(process.env).filter(key => !key.includes('PASSWORD')) // безопасно показываем только имена
        })
    };
};