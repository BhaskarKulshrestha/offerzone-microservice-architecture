const axios = require("axios");

const url = "http://localhost:8085/"; // Gateway root URL
const totalRequests = 60;

const runTest = async () => {
    console.log(`Sending ${totalRequests} requests to ${url}...`);
    const start = Date.now();

    for (let i = 1; i <= totalRequests; i++) {
        const reqStart = Date.now();
        try {
            await axios.get(url);
            const duration = Date.now() - reqStart;
            console.log(`Request ${i}: Success (${duration}ms)`);
        } catch (error) {
            console.log(`Request ${i}: Error (${error.message})`);
        }
    }

    const totalTime = (Date.now() - start) / 1000;
    console.log(`\nTest completed in ${totalTime.toFixed(2)} seconds.`);
};

runTest();
