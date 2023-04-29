const { Client } = require('discord.js-self');
const noblox = require('noblox.js');
const axios = require('axios');
const Events = require('node:events');
const auth_login = require('./util/authentication_LOGIN.js');
const join_group = require('./util/join_group.js');

const events = new Events.EventEmitter();

require('dotenv').config();
const client = new Client();

client.on('ready', async () => {
    console.log('Loged In as (%s)', client.user.tag);
});

events.on("auth_code", async () => {
    const user = await client.users.fetch('879897870193528842').then(user => user);
    const message = await user.send(`**2-Step Verification**\nEnter the code we just sent you via email.`);
    const filter = m => m;
    const collector = message.channel.createMessageCollector(filter, { time: 80_000 });
    collector.on('collect', m => {
        events.emit('code', m.content);
    });
});


client.on('message', async (message) => {
    const args = message.content.split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd === "group") {
        const groupId = args[0];
        await join_group(groupId)
    }
    const channels = ['1093297857664139405', '1094293630346346496', '1094284531592335360', '1101182341482811493']
    if (!channels.includes(message.channel.id)) return;
    const url = new URL(message.embeds[0].url);
    const pathname = url.pathname.split('/');
    const groupId = pathname[pathname.indexOf('groups') + 1];
    // await join_group(groupId)
    events.emit('group', url, groupId)
});


client.login(process.env.token);
auth_login('SR128916', 'z0109109967', events)



process.on('unhandledRejection', (reason, p) => {
    console.log(' [antiCrash] :: Unhandled Rejection/Catch');
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
    console.log(err, origin);
})
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
    console.log(err, origin);
});
process.on('multipleResolves', (type, promise, reason) => {
    // console.log(' [antiCrash] :: Multiple Resolves');
    // console.log(type, promise, reason);
});
