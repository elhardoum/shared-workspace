module.exports = (req, res) =>
{
  Object.assign(res.locals, {
    title: 'My Profile',
  })

  return res.render('profile')
}