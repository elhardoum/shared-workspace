module.exports = (req, res) =>
{
  if ( res.locals.user ) {
    const cookie = Util.getCookie(req, 'uid')
        , sessions = res.locals.user.sessions || []
        , index = sessions.indexOf(cookie.replace(/d\d+$/, ''))

    if ( -1 != index ) {
      const User = require('./../model/User')
      sessions.splice(index, 1)
      User.update(res.locals.user.id, { sessions })
    }
  }

  Util.setCookie( req, res, 'uid', null, { signed: true, delete: true } )

  return res.redirect('/')
}
