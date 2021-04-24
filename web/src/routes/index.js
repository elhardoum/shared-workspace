module.exports = {
  login: require('./login'),
  register: require('./register'),
  logout: require('./logout'),
  home: require('./home'),
  profile: {
    view: require('./profile'),
    edit: require('./profile-edit'),
  },
  properties: {
    admin: require('./owner/properties-admin'),
    new: require('./owner/new-property'),
    edit: require('./owner/edit-property'),
  },
  workspaces: {
    admin: require('./owner/workspaces-admin'),
    new: require('./owner/new-workspace'),
    edit: require('./owner/edit-workspace'),
    myrentals: require('./coworker/my-rentals'),
  },
}