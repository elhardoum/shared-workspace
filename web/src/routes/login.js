module.exports = (req, res) =>
{
  if ( res.locals.logged_in )
    return res.redirect('/')

  if ( 'POST' == req.method )
    return api(req, res)

  Object.assign(res.locals, {
    title: 'Login',
  })

  return res.render('login')
}

const api = async (req, res) =>
{
  const { email, password } = req.body

  if ( ! email.trim() )
    return res.json({ success: false, errors: [ { field: '#email', error: 'Email cannot be empty.' } ] })

  if ( ! password.length )
    return res.json({ success: false, errors: [ { field: '#password', error: 'Password cannot be empty.' } ] })

  const User = require('./../model/User')
      , user = await User.getOneBy('email', email)

  if ( ! user )
    return res.json({ success: false, errors: [
      { field: '#email', error: 'Invalid credentials.' },
      { field: '#password', error: 'Invalid credentials.' } ] })

  if ( ! await User.comparePasswords(password, user.password) )
    return res.json({ success: false, errors: [ { field: '#password', error: 'Incorrect password entered.' } ] })

  if ( await User.login(req, res, user) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}