const axios = require('axios');
require('dotenv').config();

async function authentication_TICKET() {
    axios.post('https://auth.roblox.com/v1/authentication-ticket', {
        ctype: 'Username',
        cvalue: 'JoePaPa_Dev',
        password: ''
    }).then((response) => {
        const authTicket = response.data.ticket;
        console.log('Authentication ticket:', authTicket);
    }).catch((error) => {
        console.error('Failed to obtain authentication ticket:', error);
    });
}

module.exports = authentication_TICKET;