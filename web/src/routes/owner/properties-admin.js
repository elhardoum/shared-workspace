module.exports = async (req, res) =>
{
  if ( 'owner' != res.locals.user.type )
    return res.redirect('/properties')

  const Properties = require('./../../model/Properties')

  Object.assign(res.locals, {
    title: 'My Properties & Workspaces',
    items: await Properties.query({
      fields: {
        ownerid: res.locals.user.id,
      },
      orderby: 'id',
      order: 'desc',
    })
  })

  return res.render('owner/properties')
}