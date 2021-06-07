const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    userId: Number,
    tukisPerServer: Array,
    username: String,
    discriminator: Number,
    avatar: String
})
module.exports = mongoose.model('User', userSchema)