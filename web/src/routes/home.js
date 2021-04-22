module.exports = (req, res, ...args) =>
{
  if ( ! res.locals.logged_in ) {
    return res.redirect('/login')
  } else if ( 'coworker' == res.locals.user.type ) {
    return require('./coworker/')(req, res, ...args)
  } else if ( 'owner' == res.locals.user.type ) {
    return require('./owner/')(req, res, ...args)
  } else {
    return res.status(400).send('Error 400 - Bad Request')
  }
}