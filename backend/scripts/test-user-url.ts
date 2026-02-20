
import axios from 'axios';

const BASE_URL = "http://192.168.0.7:6017/api/millenium_eco";

// Using the EXACT path and params provided by the user (but with auth)
const ENDPOINT = "/pedido_venda/listafaturamentos";

const AUTH = {
    username: "api.merxils",
    password: "Yun1R6jk7rAn62WesKB7@"
};

async function testUserUrl() {
    console.log("🔍 Testing User Provided URL...");

    // User provided params: 
    // aprovado=true
    // $format=json
    // $top=50
    // data_atualizacao_final=2025-12-31T23:59:59 (Normalized for API likely needs time if not provided)
    // data_emissao_inicial=2025-12-13T00:00:00 (Normalized)
    // $select=id_vendedor

    // Note: User provided date strings like "2025-12-31". Usually API needs ISO. 
    // I will try exactly as user provided first (if axios tolerates it), or slightly normalized.
    // The user's example in browser might work due to browser handling or API leniency.
    // Let's try to replicate the query string exactly.

    const params = {
        "aprovado": "true",
        "$format": "json",
        "$top": "50",
        "data_atualizacao_final": "2025-12-31T23:59:59.999Z", // Adding time to be safe/consistent with previous checks
        "data_emissao_inicial": "2025-12-13T00:00:00.000Z",   // Adding time
        "$select": "id_vendedor"
    };

    const url = `${BASE_URL}${ENDPOINT}`;
    console.log(`URL: ${url}`);
    console.log(`Params: ${JSON.stringify(params)}`);

    try {
        const response = await axios.get(url, {
            params: params,
            auth: AUTH,
            timeout: 15000 // 15s timeout
        });
        console.log(`✅ SUCCESS: ${response.status} ${response.statusText}`);
        console.log(`   📦 Data: Found ${response.data?.value?.length || 0} items`);
        if (response.data?.value?.length > 0) {
            console.log("Sample Item:");
            console.log(JSON.stringify(response.data.value[0], null, 2));
        }
    } catch (error: any) {
        if (error.response) {
            console.log(`❌ ERROR: ${error.response.status} ${error.response.statusText}`);
            console.log(error.response.data);
        } else {
            console.log(`❌ ERROR: ${error.message}`);
        }
    }
}

testUserUrl();
