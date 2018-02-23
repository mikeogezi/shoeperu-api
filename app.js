'use strict'

let path = require('path')

let express = require('express')
let bodyParser = require('body-parser')
let favicon = require('serve-favicon')
let ms = require('ms')
let compression = require('compression')
let multer = require('multer')

let api = require('./app/api')

let app = express()

app.set('env', process.env.NODE_ENV || 'development');
app.set('homedir', __dirname)
app.set('port', process.env.PORT || 8080)
// app.set('views', __dirname + '/public/views/pug')
// app.set('view engine', 'pug')

app.locals.year = new Date().getFullYear()
app.locals.designerPerson = 'Michael Ogezi'
app.locals.designerPersonSite = 'http://makerloom-web.herokuapp.com'

app.use(compression())
// app.use(express.static(path.join(__dirname + '/public'), {
//     maxAge: process.env.NODE_ENV == 'production' ? ms('10 days') : ms('0')
// }))
app.use(bodyParser.json({
    limit: '50mb'
}))
// app.use(favicon(path.join(__dirname, '/public/images/logo.ico')))
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use((req, res, next) => {
    console.log(req.path);
    next();
})

// API Home
app.all('/api', api.index)
// API Search
app.post('/api/search', api.search)
// API Text Search
app.all('/api/textSearch', api.textSearch)
// API Featured
app.all('/api/featured', api.featured)

app.locals.pretty = true

app.listen(app.get('port'), () => {
    console.log(`Listening or port ${app.get('port')} in ${app.get('env')}`)
})
