const Properties = require('./../../model/Properties')
    , Workspaces = require('./../../model/Workspaces')

module.exports = async (req, res) =>
{
  if ( 'coworker' != res.locals.user.type )
    return res.redirect('/')

  if ( 'DELETE' == req.method )
    return apiDelete(req, res)

  if ( 'PUT' == req.method )
    return apiPut(req, res)

  Object.assign(res.locals, {
    title: 'My Rented Workspaces',
    items: await Workspaces.query({
      fields: {
        renterid: res.locals.user.id,
      },
      orderby: 'id',
      order: 'desc',
    })
  })

  return res.render('coworker/my-rentals')
}

const apiDelete = async (req, res) =>
{
  const { id } = req.body

  const workspace = await Workspaces.getOneBy('id', id)

  if ( ! workspace || res.locals.user.id != workspace.renterid )
    return res.json({ success: true })

  if ( await Workspaces.update(id, { renterid: null }) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}

const apiPut = async (req, res) =>
{
  const { id } = req.body

  const workspace = await Workspaces.getOneBy('id', id)

  if ( ! workspace )
    return res.status(404).json({ success: false, errors: [{ field: null, error: 'Workspace not found.' }] })

  if ( ! workspace.renterid )
    return res.status(400).json({ success: false, errors: [{ field: null, error: 'Workspace already occupied.' }] })

  if ( await Workspaces.update(id, { renterid: res.locals.user.id }) )
    return res.json({ success: true })

  return res.json({ success: false, errors: [{ field: null, error: 'Internal server error, please try again.' }] })
}