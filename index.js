require('dotenv').config();
require('./connectiondb.js');
const {Client, MessageEmbed} = require('discord.js');
    client = new Client();
    prefix = '¡';
const User = require('./models/user');

client.on('message', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

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
        setTimeout(async () => {
            await User.find({}).then(rep => {
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
    if(command == 'stats'){
        let userIdTarget = args.join('').slice(3, args.join('').length - 1)
        if(userIdTarget){
            await User.find({userId: userIdTarget})
            .then(rep => {
                let tukiQtyInThisServer = []
                rep[0].tukisPerServer.map(item => {
                    if(item.serverId === message.guild.id) tukiQtyInThisServer.push(item.tukiCounter)
                })
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setAuthor(rep[0].username, rep[0].avatar)
                .setDescription(`Tiene \`${tukiQtyInThisServer[0]}\` tukis en el server`)
                message.channel.send(embed)
            })
            .catch(error => {
                console.log(error)
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setDescription('No encontré datos de ese usuario pa')
                message.channel.send(embed)
            })
        } else {
            let tukisInThisServer = await User.find({}).then(rep => {
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
                return totalServerTuki
            })
            let top5TukisPerUser = await User.find({}).then(rep => {
                let tukisPerUser = []
                rep.map(item => {
                    let userInfo = {
                        userId: item.userId,
                        username: item.username,
                        discriminator: item.discriminator,
                        avatar: item.avatar
                    };
                    item.tukisPerServer.map(tukis => {
                        if(tukis.serverId === message.guild.id){
                            tukisPerUser.push({
                                ...userInfo,
                                tukiCounter: tukis.tukiCounter
                            })
                        }
                    })
                })
                let sortingArrayAscendent = tukisPerUser.sort((a,b) => {return b.tukiCounter - a.tukiCounter})
                let top5 = []
                sortingArrayAscendent.map((item, index) => {
                    if(index >= 4)top5.push(item);
                })
                return tukisPerUser;
            })
            let top5 = [];
            top5TukisPerUser.map(item => {
                top5.push(`${item.username}: \`${item.tukiCounter}\`\n`)
            })
            let top5string = top5.join('')
            let embed = new MessageEmbed()
            .setColor('ffa07a')
            .setThumbnail(top5TukisPerUser[0].avatar)
            .setTitle(`Tenemos \`${tukisInThisServer}\` tukis en el server paaa`)
            .setDescription(`Top 5:\n
            ${top5string}
            Si querés saber los tukis de alguien en particular usá \`${prefix}stats @usuario\``)
            message.channel.send(embed)
        }
    }
})

client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('Discord ✅'))