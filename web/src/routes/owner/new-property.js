module.exports = async (req, res) =>
{
  if ( 'owner' != res.locals.user.type )
    return res.redirect('/properties')

  if ( 'PUT' == req.method )
    return api(req, res)

  Object.assign(res.locals, {
    title: 'New Property',
  })

  return res.render('owner/new-property')
}

const api = async (req, res) =>
{
  const { title, address, squareft, garage, publictransportation, listed } = req.body
      , Properties = require('./../../model/Properties')

  if ( ! title.trim() )
    return res.json({ success: false, errors: [ { field: '#title', error: 'Title cannot be empty.' } ] })

  if ( ! address.trim() )
    return res.json({ success: false, errors: [ { field: '#address', error: 'Address cannot be empty.' } ] })

  if ( Number(squareft) <= 0 || isNaN(Number(squareft)) )
    return res.json({ success: false, errors: [ { field: '#squareft', error: 'Size invalid or not specified.' } ] })

  if ( await Properties.create(res.locals.user.id, title.trim(), address.trim(), Number(squareft), !!garage, !!publictransportation, !!listed) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}