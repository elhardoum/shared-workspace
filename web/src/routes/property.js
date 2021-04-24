module.exports = async (req, res) =>
{
  const Properties = require('./../model/Properties')
      , Workspaces = require('./../model/Workspaces')
      , moment = require('moment')
      , property = (await Properties.query({
      fields: {
        id: Number(req.params.id),
      },
      limit: 1
    })).shift()

  if ( ! property ) {
    res.locals.title = 'Error 404 - Property Not Found'
    return res.status(404).render('404')
  }

  Object.assign(res.locals, {
    title: `${property.title} - Property Workspaces for Rent`,
    property,
    workspaces: await Workspaces.query({
      fields: {
        propertyid: property.id,
        listed: true,
      },
      available_lte: moment(+new Date).format('YYYY-MM-DD'),
    })
  })

  return res.render('property')
}