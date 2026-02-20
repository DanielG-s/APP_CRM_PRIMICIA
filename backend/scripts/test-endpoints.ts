
import axios from 'axios';

const BASE_URL = "http://192.168.0.7:6017/api/millenium_eco";
const AUTH = {
    username: "api.merxils",
    password: "Yun1R6jk7rAn62WesKB7@"
};

const ENDPOINTS = [
    "/faturamento/listafaturamentos", // Current (404)
    "/listafaturamentos",             // Probable
    "/vendas/listafaturamentos",
    "/pedido_venda/listafaturamentos",
    "/produtos/listavitrine"          // Control (Should work if API is up)
];

async function testEndpoints() {
    console.log("🔍 Testing Millenium API Endpoints...");
    console.log(`Base URL: ${BASE_URL}`);

    for (const endpoint of ENDPOINTS) {
        const url = `${BASE_URL}${endpoint}?$top=1`;
        try {
            console.log(`\n👉 Testing: ${endpoint}`);
            const response = await axios.get(url, {
                auth: AUTH,
                timeout: 5000
            });
            console.log(`   ✅ STATUS: ${response.status} ${response.statusText}`);
            console.log(`   📦 Data: Found ${response.data?.value?.length || 0} items`);
        } catch (error: any) {
            if (error.response) {
                console.log(`   ❌ ERROR: ${error.response.status} ${error.response.statusText}`);
            } else {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        }
    }
}

testEndpoints();
