require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const STORMMCP_URL = process.env.STORMMCP_URL;
const STORMMCP_API_KEY = process.env.STORMMCP_API_KEY;

async function verifyStorm() {
    console.log('🧪 StormMCP Gateway Bağlantısı Test Ediliyor...');

    if (!STORMMCP_URL || !STORMMCP_API_KEY) {
        console.error('❌ Hata: STORMMCP_URL ve STORMMCP_API_KEY ortam değişkenleri tanımlanmalıdır.');
        process.exit(1);
    }

    console.log(`🔗 URL: ${STORMMCP_URL}`);

    try {
        const response = await fetch(STORMMCP_URL, {
            method: 'GET',
            headers: {
                'X-API-Key': STORMMCP_API_KEY,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        
        // MCP gateway genellikle Mcp-Session-Id bekler, 
        // bu yüzden hata gelse bile gateway'e ulaştığımızı teyit eder.
        if (response.status === 200 || data.error === "Mcp-Session-Id header is required") {
            console.log('\n✅ StormMCP: GATEWAY ERİŞİLEBİLİR');
            console.log('ℹ️  Not: Gateway aktif ve isteği aldı (Session-Id bekliyor).');
        } else {
            console.log('\n⚠️  StormMCP: BEKLENMEDİK YANIT');
            console.log('Yanıt:', data);
        }
    } catch (error) {
        console.error('\n❌ StormMCP: BAĞLANTI HATASI');
        console.error('Hata:', error.message);
    }
}

verifyStorm();
