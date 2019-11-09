// .env 
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI
const SENDGRID_API = process.env.SENDGRID_API

// modules config
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API)
const flash = require('connect-flash')
const crypto = require('crypto')

const app = express()

const User = require('./models/User')
const Joke = require('./models/Joke')

// set & use
app.set('view engine', 'ejs')
app.use(
    bodyParser.urlencoded({
        extended: false
    }),
    express.static(__dirname + 'public'),
    session({
        secret: '123456',
        resave: false,
        saveUninitialized: false
    }),
    flash()
)

// Route
app.get('/', async (req, res, next) => {
    const user = await User.find()

    res.render('app', {
        user: user,
        flash: req.flash('error')
    })
})

app.post('/', async (req, res, next) => {
    const email = req.body.email

    const token = crypto.randomBytes(32).toString('hex')

    const newUser = new User({
        email: email,
        confirmToken: token,
        confirmTokenExpiration: Date.now() + 3600000
    })
    const result = await newUser.save()

    if (result) {
        req.flash('error', 'email Signed Up')
        res.redirect('/')

        return await sgMail.send({
            to: email,
            from: 'Storcego@outlook.com',
            subject: 'Email Confirmation',
            text: 'Open this link to confirm your email',
            html: `<p>Click this <a href="http://localhost:5000/confirm/${token}">link</a> to confirm your email</p>`
        })
    }

    req.flash('error', 'Try Signingup again later')
    return res.redirect('/')
})

app.get('/confirm/:token', async (req, res, next) => {
    const token = req.params.token

    const user = await User.findOne({
        confirmToken: token,
        confirmTokenExpiration: {
            $gt: Date.now()
        }
    })

    if(!user) {
        req.flash('error', 'nO uSeR fOuNdEd')
        return res.redirect('/')
    }

    user.active = true;
    user.confirmToken = undefined;
    user.confirmTokenExpiration = undefined;
    
    const result = user.save()

    if (result) {
        req.flash('error', 'user active')
        return res.redirect('/')
    }

    req.flash('error', 'Try Confirming again later')
    return res.redirect('/')
})


const PORT = process.env.PORT || 5000;
// Server
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        app.listen(PORT);
        console.log(`Server & MongoDB on port: ${PORT}`);

    })
    .catch(err => {
        console.log(err);
    });