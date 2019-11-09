const mongoose = require('mongoose')

const Schema = mongoose.Schema

const jokeSchema = new Schema({
    name: {
        type: String
    }
})

module.exports = mongoose.model('Joke', jokeSchema)