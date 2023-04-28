const { Client } = require('discord.js-self');
const noblox = require('noblox.js');
const auth = require('./util/authentication_TICKET.js');
const auth_token = require('./util/authentication_xcsrf.js');

require('dotenv').config();
const client = new Client();

client.on('ready', async () => {
    console.log('Loged In as (%s)', client.user.tag);
    await noblox.setCookie(process.env.cookie).then(user => {
        console.log(`Connected To (${user.UserName}) Account`)
    });
});

client.on('message', async (message) => {
    const channels = ['1093297857664139405', '1094293630346346496', '1094284531592335360']
    if (!channels.includes(message.channel.id)) return;
    console.log(message.embeds[0]);
    const url = new URL(message.embeds[0].url);
    const pathname = url.pathname.split('/');
    const groupId = pathname[pathname.indexOf('groups') + 1];
    console.log(groupId)

    await cliam(groupId).then(data => {
     console.log('climed one group')
     console.log(data)
    });
})


async function cliam(groupId) {
    return new Promise(async (res) => {
        const token = await auth_token();
        const req = await noblox.http(`https://groups.roblox.com/v1/groups/${groupId}/claim-ownership`, {
            method: 'post',
            headers: {
                'cookie': `.ROBLOSECURITY=${process.env.cookie}`,
                'x-csrf-token': token
            }
        }).then(data => {
            res(data)
        });
    });
};

client.login(process.env.token)