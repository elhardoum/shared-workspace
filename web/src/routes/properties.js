module.exports = async (req, res) =>
{
  const Workspaces = require('./../model/Workspaces')
      , moment = require('moment')
      , qs = new URLSearchParams(req._parsedUrl.search)

  Object.assign(res.locals, {
    title: 'Property Search',
    items: await Workspaces.query({
      orderby: 'id',
      order: 'desc',
      available_lte: moment(+new Date).format('YYYY-MM-DD'),
      address_search: qs.get('address'),
      capacity_min: qs.get('capacity'),
      price_min: qs.get('price-min'),
      price_max: qs.get('price-max'),
      fields: {
        listed: true,
        ...( qs.get('term') && { term: qs.get('term') } ),
        ...( qs.get('smoking') && { smoking: true } ),
        ...( qs.get('categoryid') && { categoryid: qs.get('categoryid') } ),
      },
      sqft_min: qs.get('sqft-min'),
      sqft_max: qs.get('sqft-max'),
      ...( qs.get('parking') && { garage: true } ),
      ...( qs.get('publictransportation') && { publictransportation: true } ),
      property_listed: true,
    }),
    qs: Object.fromEntries(qs.entries()),
    categories: await Workspaces.getCategories(),
    filters_active: null !== qs.get('address'),
  })

  return res.render('properties')
}