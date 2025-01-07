const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// The verification expression from the documentation
const verifyResponse = (response) => {
    if (response.status === true && response.data === 1) {
        return 1;
    }
    return 0;
};

// Base API URL from the documentation
const baseUrl = 'https://lbchainwarz.buktrips.com/tasks/task/regular-claim-nft';

async function testAPI(WALLET_ADDRESS) {
    try {
        const url = `${baseUrl}?walletAddress=${WALLET_ADDRESS}`;

        console.log('Testing URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('\nAPI Response:', JSON.stringify(data, null, 2));

        // Test the verification expression
        const isValid = verifyResponse(data);
        console.log('\nVerification Result:', isValid);
        console.log('Status:', isValid === 1 ? 'VALID ✅' : 'INVALID ❌');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Ask for wallet address if not provided as command line argument
if (process.argv[2]) {
    testAPI(process.argv[2]);
} else {
    rl.question('Please enter a wallet address to test: ', (address) => {
        testAPI(address);
        rl.close();
    });
} 