const axios = require('axios');

async function testEndpoints() {
    const API_URL = 'http://localhost:3333';
    const headers = {}; // No token for now, should just return 401, not crash

    const endpoints = [
        '/settings/store',
        '/users',
        '/settings/email',
        '/settings/whatsapp',
        '/config/roles'
    ];

    console.log("Starting 5 parallel requests...");

    try {
        const results = await Promise.allSettled(
            endpoints.map(ep => axios.get(`${API_URL}${ep}`, { headers }))
        );

        results.forEach((res, i) => {
            console.log(`[${endpoints[i]}] ->`, res.status === 'fulfilled' ? res.value.status : res.reason.message);
        });
    } catch (error) {
        console.error("Fatal error:", error.message);
    }
}

testEndpoints();
