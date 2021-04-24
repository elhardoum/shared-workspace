module.exports = new class Properties
{
  COLUMNS = [ 'id', 'ownerid', 'title', 'address', 'squareft', 'garage', 'publictransportation', 'listed' ]

  async query({ fields={}, limit=null, search=null, squareft_min, squareft_max, orderby='id', order='desc' })
  {
    const conn = await Util.dbConn()
        , sql = require('mssql')
        , req = new sql.Request(conn)
    
    let stmt = `select ${limit ? `top ${limit} ` : ''} p.*, u.email as owner_email, u.name as owner_name, u.phone as owner_phone from Properties p`
      , where = ` where 1=1`

    for ( let field in fields ) {
      if ( -1 == this.COLUMNS.indexOf(field) )
        continue

      where += ` and p.${field} = @${field}`
      req.input(field, fields[field])
    }

    if ( search ) {
      where += ' and (p.title like @s1 or p.address like @s2)'
      req.input('s1', `%${search}%`)
      req.input('s2', `%${search}%`)
    }

    if ( squareft_min ) {
      where += ' and p.squareft >= @sqftmin'
      req.input('sqftmin', squareft_min)
    }

    if ( squareft_max ) {
      where += ' and p.squareft <= @sqftmax'
      req.input('sqftmax', squareft_max)
    }

    stmt += ` join Users u on u.id = p.ownerid ${where}`

    if ( -1 != this.COLUMNS.indexOf(orderby) ) {
      stmt += ` order by ${orderby}`
    } else {
      stmt += ' order by id'
    }

    stmt += /^(desc)|(asc)$/i.test(order) ? ` ${order}` : ' desc'

    try {
      const results = await req.query(stmt)
      conn.close()

      return results.recordset.map(this.parse)
    } catch (err) {
      return void console.log(`query error: ${err}`) || []
    }
  }

  async queryOne(args)
  {
    args.limit = 1
    return (await this.query(args)).shift()
  }

  parse(item)
  {
    item.owner_avatar = `https://www.gravatar.com/avatar/${require('crypto').createHash('md5').update(item.owner_email).digest('hex')}?d=mp`

    return item
  }

  async create( ownerid, title, address, squareft, garage, publictransportation, listed=true )
  {
    const conn = await Util.dbConn()

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      req.input('ownerid', ownerid)
      req.input('title', title)
      req.input('address', address)
      req.input('squareft', squareft)
      req.input('garage', garage)
      req.input('publictransportation', publictransportation)
      req.input('listed', listed)

      const status = await req.query(`insert into Properties (ownerid, title, address, squareft, garage, publictransportation, listed)
        values (@ownerid, @title, @address, @squareft, @garage, @publictransportation, @listed)`)
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
      let stmt = 'update Properties set '

      for ( let prop in update ) {
        if ( -1 == this.COLUMNS.indexOf(prop) )
          continue

        req.input(prop, update[prop])
        stmt += `${prop} = @${prop}, `
      }

      stmt = stmt.replace(/\, $/, '')
      stmt += ` where id = ${Number(id)}`

      const status = await req.query(stmt)
      conn.close()

      return !! status.rowsAffected
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async delete(ids)
  {
    const _ids = [].concat(ids).map(n => Number(n)).filter(n => n > 0)

    if ( ! _ids.length )
      return

    const conn = await Util.dbConn()

    try {
      const status = await conn.query(`delete from Properties where id in (${_ids.join(',')})`)
      conn.close()
      return !! status.rowsAffected
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }
}