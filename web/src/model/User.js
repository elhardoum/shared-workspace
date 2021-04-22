module.exports = new class User
{
  COLUMNS = [
    'id', 'name', 'email', 'password', 'phone', 'type', 'sessions',
  ]

  async getBy(field, value, limit=null)
  {
    const conn = await Util.dbConn()

    if ( -1 == this.COLUMNS.indexOf(field) )
      return []

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      req.input('value', value)

      const results = await req.query(`select ${limit ? `top ${limit} ` : ''}* from Users where ${field} = @value`)
      conn.close()

      return results.recordset.map(this.parse)
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async getOneBy(...args)
  {
    return (await this.getBy(...args, 1)).shift()
  }

  parse(user)
  {
    if ( ! Array.isArray(user.sessions) )
      user.sessions = (user.sessions||'').split(',').map(x => x.trim()).filter(Boolean)

    return user
  }

  async comparePasswords( plaintext_password, password )
  {
    return await require('bcryptjs').compare( plaintext_password, password )
  }

  async login(req, res, user)
  {
    const session = await Util.random(20)
    user.sessions.push(session)
    user.sessions = user.sessions.reverse().slice(0,10).reverse() // keep last 10
    
    if ( ! await this.update(user.id, { sessions: user.sessions }) )
      return false

    Util.setCookie( req, res, 'uid', `${session}d${user.id}`, { signed: true } )

    return true
  }

  async emailExists( email )
  {
    const conn = await Util.dbConn()

    try {
      const result = await conn.query`select top 1 id from Users where email = ${email}`
      conn.close()
      return result.recordset.length > 0
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async hashPassword(password)
  {
    return await require('bcryptjs').hash(password, 10)
  }

  async register( name, email, password, phone, type )
  {
    const conn = await Util.dbConn()

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      req.input('name', name)
      req.input('email', email)
      req.input('password', await this.hashPassword(password))
      req.input('phone', phone)
      req.input('type', type)

      const status = await req.query('insert into Users (name, email, password, phone, type) values (@name, @email, @password, @phone, @type)')
      conn.close()

      return !! status.rowsAffected
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async update(id, update)
  {
    const conn = await Util.dbConn()

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      let stmt = 'update Users set '

      for ( let prop in update ) {
        if ( -1 == this.COLUMNS.indexOf(prop) )
          continue

        if ( 'sessions' == prop.toLowerCase() && Array.isArray(update[prop]) )
          update[prop] = update[prop].filter(Boolean).join(',')

        req.input(prop, update[prop])
        stmt += `${prop} = @${prop}, `
      }

      stmt = stmt.replace(/\, $/, '')

      const status = await req.query(stmt)
      conn.close()

      return !! status.rowsAffected
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async authMiddleware(req, res, next)
  {
    Object.assign(res.locals, { logged_in: false, user: null })

    const cookie = Util.getCookie(req, 'uid')

    if ( ! cookie || ! cookie.match(/d\d+$/) )
      return next()

    const id = parseInt( (cookie.match(/d\d+$/)[0]||'').substr(1) )
    
    if ( id <= 0 )
      return next()

    const user = await this.getOneBy('id', id)

    if ( user && -1 != (user.sessions||[]).indexOf(cookie.replace(/d\d+$/, '')) )
      Object.assign(res.locals, { logged_in: true, user })

    return next()
  }
}