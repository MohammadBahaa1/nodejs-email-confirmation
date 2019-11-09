const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }, 
    confirmToken: String,
    confirmTokenExpiration: Date,
    active: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema);