const Properties = require('./../../model/Properties')
    , Workspaces = require('./../../model/Workspaces')
    , moment = require('moment')

module.exports = async (req, res) =>
{
  if ( 'owner' != res.locals.user.type )
    return res.redirect('/properties')

  const property = await getProperty(req, res)

  if ( ! property )
    return res.redirect('/')

  if ( 'PUT' == req.method )
    return api(req, res)

  Object.assign(res.locals, {
    title: 'New Workspace',
    categories: await Workspaces.getCategories(),
  })

  return res.render('owner/new-workspace')
}

const api = async (req, res) =>
{
  const { categoryid, title, capacity, available, term, price, smoking, listed } = req.body

  if ( ! ( Number(categoryid) > 0 ) )
    return res.json({ success: false, errors: [ { field: '#categoryid', error: 'Category cannot be empty.' } ] })

  if ( ! title.trim() )
    return res.json({ success: false, errors: [ { field: '#title', error: 'Twitle cannot be empty.' } ] })

  if ( ! ( Number(capacity) > 0 ) )
    return res.json({ success: false, errors: [ { field: '#capacity', error: 'Capacity invalid or not specified.' } ] })

  if ( ! ( +new Date(available) > 0 ) )
    return res.json({ success: false, errors: [ { field: '#available', error: 'Availability date invalid or not specified.' } ] })

  if ( moment(available).diff(moment(+new Date).format('YYYY-MM-DD')) < 0 )
    return res.json({ success: false, errors: [ { field: '#available', error: 'Availability date cannot be in the past.' } ] })

  if ( -1 == ['day','week','month'].indexOf(term) )
    return res.json({ success: false, errors: [ { field: '#term', error: 'Term cannot be empty.' } ] })

  if ( ! ( Number(price) > 0 ) )
    return res.json({ success: false, errors: [ { field: '#price', error: 'Term price invalid or not specified.' } ] })

  const categories = await Workspaces.getCategories()

  if ( ! categories.find(c => c.id == Number(categoryid)) )
    return res.json({ success: false, errors: [ { field: '#categoryid', error: 'Invalid category submitted.' } ] })

  if ( await Workspaces.create(Number(req.params.id), Number(categoryid), title.trim(), Number(capacity), !!smoking, available, term, Number(price), null, !!listed) )
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