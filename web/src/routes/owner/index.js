module.exports = (req, res) =>
{
  Object.assign(res.locals, {
    title: 'My Properties & Workspaces',
  })

  return res.render('owner/home')
}