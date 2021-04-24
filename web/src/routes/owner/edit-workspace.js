const Properties = require('./../../model/Properties')
    , Workspaces = require('./../../model/Workspaces')
    , moment = require('moment')

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

  const workspace = await getWorkspace(req, res)

  if ( ! workspace )
    return res.redirect('/')

  Object.assign(res.locals, {
    title: 'Edit Property',
    property,
    workspace,
    categories: await Workspaces.getCategories(),
  })

  return res.render('owner/new-workspace')
}

const apiPatch = async (req, res) =>
{
  const property = await getProperty(req, res)

  if ( ! property )
    return res.status(404).end()

  const workspace = await getWorkspace(req, res)

  if ( ! workspace )
    return res.status(404).end()

  const { categoryid, title, capacity, available, term, price, smoking, remove_tenant, listed } = req.body

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

  const id = workspace.id, update = Object.assign(workspace, {
    categoryid: Number(categoryid),
    title: title.trim(),
    capacity: Number(capacity),
    smoking: !!smoking,
    available,
    term,
    price: Number(price),
    listed: !!listed,
  }, remove_tenant ? { renterid: null } : {})
  delete update.id

  if ( await Workspaces.update(id, update) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}

const apiDelete = async (req, res) =>
{
  const property = await getProperty(req, res)

  if ( ! property )
    return res.json({ success: true })

  const workspace = await getWorkspace(req, res)

  if ( ! workspace )
    return res.json({ success: true })

  if ( await Workspaces.delete([ workspace.id ]) )
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

const getWorkspace = async (req, res) => (await Workspaces.query({
  fields: {
    id: Number(req.params.wid),
    propertyid: Number(req.params.id),
  },
  limit: 1
})).shift()