const http = require('http');

function makeRequest(origin) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3333,
            path: '/api',
            method: 'GET',
            headers: {
                'Origin': origin
            }
        }, (res) => {
            console.log(`\n--- TEST: Origin ${origin} ---`);
            console.log('Status Code:', res.statusCode);
            console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin'] || 'NONE');
            console.log('X-Powered-By:', res.headers['x-powered-by'] || 'Removed (Good)');
            console.log('Strict-Transport-Security:', res.headers['strict-transport-security'] ? 'Present' : 'Missing');
            resolve();
        });

        req.on('error', (e) => {
            console.error(`Problem with request to origin ${origin}: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function run() {
    await makeRequest('http://evil.com');
    await makeRequest('http://localhost:3000');
}

run();
