const mongoose = require('mongoose')
const serverConfigSchema = mongoose.Schema({
    prefix: String,
    serverId: Number,
    serverName: String
})
module.exports = mongoose.model('ServerConfig', serverConfigSchema);