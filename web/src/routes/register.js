module.exports = (req, res) =>
{
  if ( res.locals.logged_in )
    return res.redirect('/')

  if ( 'PUT' == req.method )
    return api(req, res)

  Object.assign(res.locals, {
    title: 'Register',
  })

  return res.render('register')
}

const api = async (req, res) =>
{
  const { name, email, password, phone, type } = req.body

  if ( ! name.trim() )
    return res.json({ success: false, errors: [ { field: '#name', error: 'Name cannot be empty.' } ] })

  if ( ! email.trim() )
    return res.json({ success: false, errors: [ { field: '#email', error: 'Email cannot be empty.' } ] })

  if ( password.length < 6 )
    return res.json({ success: false, errors: [ { field: '#password', error: 'Password should be 6 characters at least.' } ] })

  if ( -1 == ['coworker','owner'].indexOf(type) )
    return res.json({ success: false, errors: [ { field: '#type', error: 'Invalid account type.' } ] })

  const User = require('./../model/User')

  if ( await User.register(name.trim(), email.trim(), password, phone, type) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}