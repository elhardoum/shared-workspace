module.exports = (req, res) =>
{
  Object.assign(res.locals, {
    title: 'Property Search',
  })

  return res.render('coworker/home')
}