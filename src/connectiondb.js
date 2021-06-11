const mongoose = require('mongoose')
mongoose.connect(process.env.MONGOOSE_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open', () => console.log('Connection to MongoDB ✅'))
mongoose.connection.on('error', (err) => console.log(err))