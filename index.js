require('dotenv').config();
require('./connectiondb.js');
const {Client, MessageEmbed} = require('discord.js');
    client = new Client();

const User = require('./models/user')

client.on('message', async (message) => {
    if (message.author.bot) return;
    if(message.content.toLowerCase().includes("tuki")){
        User.findOne({userId: message.author.id}, (error, user) => {
            if(error)console.log(error)
            if(user){
                let serverId = user.tukisPerServer.filter(item => item.serverId === message.guild.id)
                if(serverId.length === 0){
                    user.tukisPerServer.push({
                        serverName: message.guild.name,
                        serverId: message.guild.id,
                        tukiCounter: 1
                    })
                    user.save().catch(err => console.log(err))
                } else {
                    let indexServer = user.tukisPerServer.findIndex(item => item.serverId === message.guild.id)
                    let newTukiCounter = user.tukisPerServer[indexServer].tukiCounter + 1
                    User.updateOne({"tukisPerServer.serverId":message.guild.id, userId: message.author.id}, {"tukisPerServer.$.tukiCounter": newTukiCounter}, (error, rep) => {
                        if(error)console.log(error);
                    })
                }
            } else {
                const newUser = new User({
                    username: message.author.username,
                    userId: message.author.id,
                    avatar: message.author.avatarURL(),
                    discriminator: message.author.discriminator,
                    tukisPerServer:[
                        {
                            serverName: message.guild.name,
                            serverId: message.guild.id,
                            tukiCounter: 1
                        }
                    ]
                })
                newUser.save()
            }
        })
        setTimeout(() => {
            User.find({}).then(rep => {
                let totalServerTuki = rep.reduce((acc,valor) => {
                    let tukisArray = []
                    valor.tukisPerServer.map(item => {
                        if(item.serverId === message.guild.id) {
                            tukisArray.push(item.tukiCounter)
                        }
                    })
                    let tukis = tukisArray.length !== 0 ? tukisArray.reduce((acc, valor) => {return acc + valor}) : 0
                    return acc + tukis
                }, 0)
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setDescription(`opa, vamos \`${totalServerTuki}\` tukis en el server pa`)
                message.channel.send(embed)                
            })
        }, 500)
    }
})

client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('Discord ✅'))