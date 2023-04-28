const noblox = require('noblox.js');
require('dotenv').config();

async function authentication_XSCRFS() {
    const token = await noblox.getGeneralToken().catch(async e => {
        await noblox.setCookie(process.env.cookie);
        return await noblox.getGeneralToken()
    });

    return token
}

module.exports = authentication_XSCRFS