exports.handler = async function(event, context) {
    try {
        const response = await fetch('https://tonapi.io/v2/accounts/0:bc02182c000b10ed8e46d605431697f291f44d03dc1b271b175c4408b9336a45/nfts?collection=0:b696c532d522b1244241c23e5909f5672cfbc0a83ab2e5cdba5e0f314bfa434d&limit=1000&offset=0&indirect_ownership=false');
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch NFTs' })
        };
    }
};