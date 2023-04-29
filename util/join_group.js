const axios = require('axios');
require('dotenv').config();

async function join_group(groupId) {

    const XCSRF = await getCsrfToken(process.env.cookie);

    const headers = {
        'Cookie': `.ROBLOSECURITY=${process.env.cookie}`, 
        'X-CSRF-TOKEN': XCSRF, 
        'Content-Type': 'application/json'
    }

    console.log("Found a Group")

     fetch(`https://groups.roblox.com/v1/groups/${groupId}/users`, {
        method: "POST",
        headers
    }).then(data => {
        fetch(`https://groups.roblox.com/v1/groups/4824388/claim-ownership`, {
            method: "POST",
            headers
        }).then(e => {
            console.log(e);
        })
    }).catch(e => {
        console.log(e + " as Error")
    })
}


async function getCsrfToken(token) {
    try {
        const response = await fetch(
            "https://friends.roblox.com/v1/users/321/request-friendship",
            {
                method: "POST",
                headers: {
                    Cookie: `.ROBLOSECURITY=${token}`,
                },
            }
        );

        if (response.status === 403) {
            return response.headers.get("x-csrf-token");
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = join_group