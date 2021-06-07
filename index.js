require('dotenv').config();
require('./connectiondb.js');
const {Client, MessageEmbed} = require('discord.js');
    client = new Client();
client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('Discord ✅'))