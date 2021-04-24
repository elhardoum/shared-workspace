const Properties = require('./../../model/Properties')
    , Workspaces = require('./../../model/Workspaces')

module.exports = async (req, res) =>
{
  if ( 'owner' != res.locals.user.type )
    return res.redirect('/properties')

  const property = await getProperty(req, res)

  if ( ! property )
    return res.redirect('/')

  Object.assign(res.locals, {
    title: `Workspaces - ${property.title}`,
    property,
    items: await Workspaces.query({
      fields: {
        propertyid: property.id,
      },
      orderby: 'id',
      order: 'desc',
    })
  })

  return res.render('owner/workspaces')
}

const getProperty = async (req, res) => (await Properties.query({
  fields: {
    ownerid: res.locals.user.id,
    id: Number(req.params.id),
  },
  limit: 1
})).shift()