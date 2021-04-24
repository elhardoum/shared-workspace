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

// auth user object parser middleware
app.use(User.authMiddleware.bind(User))

// force logged in for specific routes middleware
app.use('/profile', User.authRedirectMiddleware.bind(User))
app.use('/profile/edit', User.authRedirectMiddleware.bind(User))
app.use('/property-admin', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/add-new', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id/workspaces/add-new', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id/workspaces/edit/:wid', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id/workspaces', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id/workspaces/add-new', User.authRedirectMiddleware.bind(User))
app.use('/property-admin/edit/:id/workspaces/:wid', User.authRedirectMiddleware.bind(User))
app.use('/my-rentals', User.authRedirectMiddleware.bind(User))

// @todo add more routes

// all
app.get('/login', routes.login)
app.post('/login', routes.login)
app.get('/register', routes.register)
app.put('/register', routes.register)
app.get('/logout', routes.logout)
app.get('/', routes.home)
app.get('/profile', routes.profile.view)
app.get('/profile/edit', routes.profile.edit)
app.patch('/profile/edit', routes.profile.edit)
// app.get('/properties', routes.home)
// app.get('/properties/view/:id', routes.home)

// owner
app.get('/property-admin', routes.properties.admin)
app.get('/property-admin/add-new', routes.properties.new)
app.put('/property-admin/add-new', routes.properties.new)
app.get('/property-admin/edit/:id', routes.properties.edit)
app.patch('/property-admin/edit/:id', routes.properties.edit)
app.delete('/property-admin/edit/:id', routes.properties.edit)

app.get('/property-admin/edit/:id/workspaces', routes.workspaces.admin)
app.get('/property-admin/edit/:id/workspaces/add-new', routes.workspaces.new)
app.put('/property-admin/edit/:id/workspaces/add-new', routes.workspaces.new)
app.get('/property-admin/edit/:id/workspaces/:wid', routes.workspaces.edit)
app.patch('/property-admin/edit/:id/workspaces/:wid', routes.workspaces.edit)
app.delete('/property-admin/edit/:id/workspaces/:wid', routes.workspaces.edit)

// coworker
app.get('/my-rentals', routes.workspaces.myrentals)
app.put('/my-rentals', routes.workspaces.myrentals)
app.delete('/my-rentals', routes.workspaces.myrentals)

global.Util = require('./src/model/Util')

const server = app.listen(process.env.HTTP_PORT, () =>
  console.log(`Server listening on localhost:${server.address().port}`))
