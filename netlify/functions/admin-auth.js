// Netlify Serverless Function for admin authentication
exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { password } = JSON.parse(event.body);
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (password === adminPassword) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Authentication successful',
                    token: Buffer.from(`admin-${Date.now()}`).toString('base64')
                })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Invalid password'
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};