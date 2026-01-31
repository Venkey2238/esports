exports.handler = async function(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { password } = JSON.parse(event.body);
        const adminPassword = process.env.ADMIN_PASSWORD || 'rodyamongus123';
        
        console.log('Auth attempt with password:', password ? 'provided' : 'not provided');
        console.log('Expected password length:', adminPassword.length);
        
        if (password === adminPassword) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    success: true,
                    message: 'Authentication successful',
                    token: Buffer.from(`admin-${Date.now()}`).toString('base64')
                })
            };
        } else {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'Invalid password. Please contact RODY for admin access.'
                })
            };
        }
    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: false,
                error: 'Internal server error. Please try again.'
            })
        };
    }
};
