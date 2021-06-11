require('dotenv').config();
require('./connectiondb.js');
const {Client, MessageEmbed} = require('discord.js');
    client = new Client();
const User = require('./models/user');
const ServerConfig = require('./models/serverconfig');
const getPrefix = async (serverId, serverName) => {
    let prefix;
    await ServerConfig.findOne({serverId: serverId})
    .then(server => {
        prefix = server.prefix
    })
    .catch(error => {
        const newServerConfig = new ServerConfig({
            serverName,
            serverId,
            prefix: '¡'
        })
        newServerConfig.save().catch(error => console.log(error))
        prefix = newServerConfig.prefix
    })
    return prefix
}

client.on('message', async (message) => {
    if (message.author.bot) return;
    const prefix = await getPrefix(message.guild.id, message.guild.name)
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    //TUKI COUNTER
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
                    ],
                    nashesPerServer:[
                        {
                            serverName: message.guild.name,
                            serverId: message.guild.id,
                            nasheCounter: 0
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
    //NASHE COUNTER
    if(message.content.toLowerCase().includes("nashe")){
        User.findOne({userId: message.author.id}, (error, user) => {
            if(error)console.log(error)
            if(user){
                let serverId = user.nashesPerServer.filter(item => item.serverId === message.guild.id)
                if(serverId.length === 0){
                    user.nashesPerServer.push({
                        serverName: message.guild.name,
                        serverId: message.guild.id,
                        nasheCounter: 1
                    })
                    user.save().catch(err => console.log(err))
                } else {
                    let indexServer = user.nashesPerServer.findIndex(item => item.serverId === message.guild.id)
                    let newNasheCounter = user.nashesPerServer[indexServer].nasheCounter + 1
                    User.updateOne({"nashesPerServer.serverId":message.guild.id, userId: message.author.id}, {"nashesPerServer.$.nasheCounter": newNasheCounter}, (error, rep) => {
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
                            tukiCounter: 0
                        }
                    ],
                    nashesPerServer:[
                        {
                            serverName: message.guild.name,
                            serverId: message.guild.id,
                            nasheCounter: 1
                        }
                    ]
                })
                newUser.save()
            }
        })
        setTimeout(async () => {
            await User.find({}).then(rep => {
                let totalServerNashe = rep.reduce((acc,valor) => {
                    let nashesArray = []
                    valor.nashesPerServer.map(item => {
                        if(item.serverId === message.guild.id) {
                            nashesArray.push(item.nasheCounter)
                        }
                    })
                    let nashes = nashesArray.length !== 0 ? nashesArray.reduce((acc, valor) => {return acc + valor}) : 0
                    return acc + nashes
                }, 0)
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setDescription(`opa, vamos \`${totalServerNashe}\` nashes en el server pa`)
                message.channel.send(embed)                
            })
        }, 500)
    }
    if(command == 'stats' && message.content.startsWith(prefix)){
        let userIdTarget = args.join('').slice(3, args.join('').length - 1)
        if(userIdTarget){
            await User.findOne({userId: userIdTarget})
            .then(rep => {
                let tukiQtyInThisServer = []
                rep.tukisPerServer.map(item => {
                    if(item.serverId === message.guild.id) tukiQtyInThisServer.push(item.tukiCounter)
                })
                let nasheQtyInThisServer = []
                rep.nashesPerServer.map(item => {
                    if(item.serverId === message.guild.id) nasheQtyInThisServer.push(item.nasheCounter)
                })
                let nasheQty = nasheQtyInThisServer.length === 0 ? 0 : nasheQtyInThisServer
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setAuthor(rep.username, rep.avatar)
                .setDescription(`Tiene \`${tukiQtyInThisServer[0]}\` tukis y \`${nasheQty}\` nashes en el server`)
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
                    if(index <= 4)top5.push(item);
                })
                return top5;
            })
            let nashesInThisServer = await User.find({}).then(rep => {
                let totalServerNashe = rep.reduce((acc,valor) => {
                    let nasheArray = []
                    valor.nashesPerServer.map(item => {
                        if(item.serverId === message.guild.id) {
                            nasheArray.push(item.nasheCounter)
                        }
                    })
                    let nashes = nasheArray.length !== 0 ? nasheArray.reduce((acc, valor) => {return acc + valor}) : 0
                    return acc + nashes
                }, 0)
                return totalServerNashe
            })
            let top5NashePerUser = await User.find({}).then(rep => {
                let nashesPerUser = []
                rep.map(item => {
                    let userInfo = {
                        userId: item.userId,
                        username: item.username,
                        discriminator: item.discriminator,
                        avatar: item.avatar
                    };
                    item.nashesPerServer.map(nashes => {
                        if(nashes.serverId === message.guild.id){
                            nashesPerUser.push({
                                ...userInfo,
                                nasheCounter: nashes.nasheCounter
                            })
                        }
                    })
                })
                let sortingArrayAscendent = nashesPerUser.sort((a,b) => {return b.nasheCounter - a.nasheCounter})
                let top5 = []
                sortingArrayAscendent.map((item, index) => {
                    if(index <= 4)top5.push(item);
                })
                return top5;
            })
            let top5Tukis = [];
            top5TukisPerUser.map(item => {
                top5Tukis.push(`${item.username}: \`${item.tukiCounter}\`\n`)
            })
            let top5Nashes = [];
            top5NashePerUser.map(item => {
                top5Nashes.push(`${item.username}: \`${item.nasheCounter}\`\n`)
            })
            let top5TukiString = top5Tukis.join('')
            let top5NasheString = top5Nashes.join('')
            let embed = new MessageEmbed()
            .setColor('ffa07a')
            .setThumbnail(top5TukisPerUser[0].avatar)
            .setTitle(`Tenemos \`${tukisInThisServer}\` tukis y \`${nashesInThisServer}\` nashes en el server paaa`)
            .setDescription(`Top 5 Tukis:\n
            ${top5TukiString}
            Top 5 Nashe:\n
            ${top5NasheString}
            Si querés saber los tukis de alguien en particular usá \`${prefix}stats @usuario\``)
            message.channel.send(embed)
        }
    }
    if(command == 'help' && message.content.startsWith(prefix)){
        let comandos = [
            {
                name: `${prefix}prefix`,
                value: `Para cambiar el prefix predeterminado, el actual es \`${prefix}\``
            },
            {
                name: `${prefix}stats`,
                value: `Para saber las estadísticas del servidor, este te mostrará la cantidad de Tukis actuales y el top 5 de los vírgenes que más tukis y nashes pusieron, si querés saber cuántos tukis y nashes puso en específico, lo podés taggear. Ejemplo: \`${prefix}stats @usuario\``
            }
        ]
        let embed = new MessageEmbed()
        .setColor('ffa07a')
        .setTitle('Estos son los comandos disponibles:')
        .addFields(comandos)
        message.channel.send(embed)
    }
    if(command == 'prefix' && message.content.startsWith(prefix)){
        ServerConfig.updateOne({serverId: message.guild.id}, {prefix: args[0]}, (error, then) => {
            if(error){
                console.log(error)
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setDescription('Ocurrió un error, intentá de nuevo')
                message.channel.send(embed)
            }
            if(then){
                let embed = new MessageEmbed()
                .setColor('ffa07a')
                .setDescription(`perfect, mi nuevo prefix es \`${args[0]}\``)
                message.channel.send(embed)
            }
        })
    }
})
client.on('guildCreate', async(guild) => {
    let prefix = await getPrefix(guild.id, guild.name)
    client.user.setActivity(`default prefix: ¡`, {type: 'PLAYING'})
})

client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('Discord ✅'))