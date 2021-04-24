const Properties = require('./../../model/Properties')

module.exports = async (req, res) =>
{
  if ( 'owner' != res.locals.user.type )
    return res.redirect('/properties')

  if ( 'PATCH' == req.method )
    return apiPatch(req, res)

  if ( 'DELETE' == req.method )
    return apiDelete(req, res)

  const property = await getProperty(req, res)

  if ( ! property )
    return res.redirect('/')

  Object.assign(res.locals, {
    title: 'Edit Property',
    property,
  })

  return res.render('owner/new-property')
}

const apiPatch = async (req, res) =>
{
  const property = await getProperty(req, res)

  if ( ! property )
    return res.status(404).end()

  const { title, address, squareft, garage, publictransportation, listed } = req.body

  if ( ! title.trim() )
    return res.json({ success: false, errors: [ { field: '#title', error: 'Title cannot be empty.' } ] })

  if ( ! address.trim() )
    return res.json({ success: false, errors: [ { field: '#address', error: 'Address cannot be empty.' } ] })

  if ( Number(squareft) <= 0 || isNaN(Number(squareft)) )
    return res.json({ success: false, errors: [ { field: '#squareft', error: 'Size invalid or not specified.' } ] })

  const id = property.id, update = Object.assign(property, {
    title: title.trim(),
    address: address.trim(),
    squareft: Number(squareft),
    garage: !!garage,
    publictransportation: !!publictransportation,
    listed: !!listed,
  })
  delete update.id
  delete update.ownerid

  if ( await Properties.update(id, update) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}

const apiDelete = async (req, res) =>
{
  const property = await getProperty(req, res)

  if ( ! property )
    return res.json({ success: true })

  if ( await Properties.delete([ property.id ]) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}

const getProperty = async (req, res) => (await Properties.query({
  fields: {
    ownerid: res.locals.user.id,
    id: Number(req.params.id),
  },
  limit: 1
})).shift()