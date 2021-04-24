module.exports = (req, res) =>
{
  if ( 'PATCH' == req.method )
    return api(req, res)

  Object.assign(res.locals, {
    title: 'Edit Profile',
  })

  return res.render('profile-edit')
}

const api = async (req, res) =>
{
  const { name, email, password, password2, phone } = req.body

  if ( ! name.trim() )
    return res.json({ success: false, errors: [ { field: '#name', error: 'Name cannot be empty.' } ] })

  if ( ! email.trim() )
    return res.json({ success: false, errors: [ { field: '#email', error: 'Email cannot be empty.' } ] })

  if ( password && password != password2 )
    return res.json({ success: false, errors: [ { field: '#password2', error: 'Password confirmation mismatch.' } ] })

  if ( password && password.length < 6 )
    return res.json({ success: false, errors: [ { field: '#password', error: 'Password should be 6 characters at least.' } ] })

  const User = require('./../model/User')

  const emailUser = await User.getOneBy('email', email)

  if ( emailUser && emailUser.id != res.locals.user.id )
    return res.json({ success: false, errors: [ { field: '#email', error: 'This email is already in use.' } ] })

  if ( await User.update(res.locals.user.id, {name: name.trim(), email: email.trim(), password, phone}) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}