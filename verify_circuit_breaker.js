const axios = require('axios');
const { exec } = require('child_process');

const OFFERS_URL = 'http://localhost:8002/offerzone/offers';

async function killService(port) {
    return new Promise((resolve, reject) => {
        exec(`lsof -t -i:${port} | xargs kill`, (error, stdout, stderr) => {
            if (error) {
                // It might fail if no process is running, which is fine for our purpose (it's already dead)
                // But if it fails for other reasons, we should know.
                // console.warn(`Kill command warning: ${ error.message } `);
            }
            resolve();
        });
    });
}

async function testCircuitBreaker() {
    console.log('--- Testing Circuit Breaker (State Transition Demo) ---');
    console.log('Ensure all services are running initially.');

    console.log('\nStarting Requests...');

    for (let i = 0; i < 10; i++) {
        const start = Date.now();

        // Simulate Failure at Request 4
        if (i === 3) {
            console.log('\n!!! KILLING PRODUCTS SERVICE (Port 8000) !!!');
            await killService(8000);
            console.log('Waiting 2 seconds for sockets to close...\n');
            await new Promise(r => setTimeout(r, 2000));
        }

        try {
            // Fetch ALL offers to see the product details
            const res = await axios.get(OFFERS_URL);
            const duration = Date.now() - start;

            // Get the first offer's product name for demonstration
            const firstOffer = res.data.offers[0];
            const productName = firstOffer ? firstOffer.product.name : 'No Offers Found';

            console.log(`Request ${i + 1}: Success(${duration}ms) - Count: ${res.data.count}`);
            console.log(`   -> Sample Product: "${productName}"`);

        } catch (err) {
            const duration = Date.now() - start;
            console.log(`Request ${i + 1}: Failed(${duration}ms) - ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\nTest Complete.');
    console.log('To restore services, run: npm run start:products');
}

testCircuitBreaker();
