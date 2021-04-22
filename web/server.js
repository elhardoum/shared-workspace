const express = require('express')
    , app = express()
    , routes = require('./src/routes/')
    , User = require('./src/model/User')

// load environment variables if deployed outside docker
undefined === process.env.HTTP_PORT && require('dotenv').config({ path: `${__dirname}/../.env` })

app.set('view engine', 'html')
app.engine('html', require('hbs').__express)
app.set('views', `${__dirname}/src/views`)
require('./src/template')

app.use(express.static(`${__dirname}/public`))
app.use(express.json())

app.use(User.authMiddleware.bind(User))

app.get('/login', routes.login)
app.post('/login', routes.login)
app.get('/register', routes.register)
app.put('/register', routes.register)
app.get('/logout', routes.logout)
app.get('/', routes.home)

global.Util = require('./src/model/Util')

const server = app.listen(process.env.HTTP_PORT, () =>
  console.log(`Server listening on localhost:${server.address().port}`))
