const axios = require('axios');

async function testMenuEndpoint() {
    const restaurantId = 1;
    const url = `http://localhost:5000/api/restaurants/${restaurantId}/menu`;
    
    console.log('Testing menu endpoint...');
    console.log('URL:', url);
    console.log('');
    
    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', response.headers);
        console.log('');
        
        const data = response.data;
        console.log('Response data:');
        console.log('- success:', data.success);
        console.log('- items count:', data.items ? data.items.length : 'N/A');
        console.log('- items is array:', Array.isArray(data.items));
        console.log('');
        
        if (data.items && data.items.length > 0) {
            console.log('First item:');
            console.log(JSON.stringify(data.items[0], null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testMenuEndpoint();
