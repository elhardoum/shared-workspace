(() =>
{
  const blocks = {}, hbs = require('hbs')

  hbs.registerHelper('extend', function(name, context) {
    let block = blocks[name]
    if ( ! block ) {
      block = blocks[name] = []
    }

    block.push(context.fn(this))
  })

  hbs.registerHelper('block', function(name) {
    let val = (blocks[name] || []).join('\n')
    // clear the block
    blocks[name] = []
    return val
  })

  hbs.registerHelper('ifeq', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this)
  })
})()