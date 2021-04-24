module.exports = new class Workspaces
{
  COLUMNS = [ 'id', 'propertyid', 'categoryid', 'title', 'capacity', 'smoking', 'available', 'term', 'price', 'renterid' ]

  async getBy(field, value, limit=null)
  {
    if ( -1 == this.COLUMNS.indexOf(field) )
      return []

    const conn = await Util.dbConn()

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      req.input('value', value)

      const results = await req.query(`select ${limit ? `top ${limit} ` : ''}
          w.*,
          c.name as categoryname,
          u.name as rentername, u.email as renteremail
          from Workspaces w
        join WorkspaceCategories c on c.id = w.categoryid
        left join Users u on u.id = w.renterid
        where w.${field} = @value`)
      conn.close()

      return results.recordset.map(this.parse)
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async query({ fields={}, limit=null, search=null, orderby='id', order='desc' })
  {
    const conn = await Util.dbConn()
        , sql = require('mssql')
        , req = new sql.Request(conn)
    
    let stmt = `select ${limit ? `top ${limit} ` : ''}
      w.*,
      c.name as categoryname,
      u.email as renteremail, u.name as rentername, u.phone as renterphone
     from Workspaces w`
      , where = ` where 1=1`

    for ( let field in fields ) {
      if ( -1 == this.COLUMNS.indexOf(field) )
        continue

      where += ` and w.${field} = @${field}`
      req.input(field, fields[field])
    }

    if ( search ) {
      where += ' and (w.title like @s1)'
      req.input('s1', `%${search}%`)
    }

    // if ( squareft_min ) {
    //   where += ' and w.squareft >= @sqftmin'
    //   req.input('sqftmin', squareft_min)
    // }

    // if ( squareft_max ) {
    //   where += ' and w.squareft <= @sqftmax'
    //   req.input('sqftmax', squareft_max)
    // }

    stmt += ` join WorkspaceCategories c on c.id = w.categoryid`
    stmt += ` left join Users u on u.id = w.renterid ${where}`

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
      return void console.log(`query error: ${err}`)
    }
  }

  async getOneBy(...args)
  {
    return (await this.getBy(...args, 1)).shift()
  }

  parse(item)
  {
    if ( item.available ) {
      item.available = require('moment')(item.available).format('YYYY-MM-DD')
      item.available_pretty = require('moment')(item.available).format('DD MMM YYYY')
    }

    if ( item.renteremail )
      item.renteravatar = `https://www.gravatar.com/avatar/${require('crypto').createHash('md5').update(item.renteremail).digest('hex')}?d=mp`

    return item
  }

  async create( propertyid, categoryid, title, capacity, smoking, available, term, price, renterid=null )
  {
    const conn = await Util.dbConn()

    try {
      const sql = require('mssql'), req = new sql.Request(conn)
      req.input('propertyid', propertyid)
      req.input('categoryid', categoryid)
      req.input('title', title)
      req.input('capacity', capacity)
      req.input('smoking', smoking)
      req.input('available', available)
      req.input('term', term)
      req.input('price', price)
      req.input('renterid', renterid)

      const status = await req.query(`insert into Workspaces (propertyid, categoryid, title, capacity, smoking, available, term, price, renterid)
        values (@propertyid, @categoryid, @title, @capacity, @smoking, @available, @term, @price, @renterid)`)
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
      let stmt = 'update Workspaces set '

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
      const status = await conn.query(`delete from Workspaces where id in (${_ids.join(',')})`)
      conn.close()
      return !! status.rowsAffected
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async getCategories()
  {
    const conn = await Util.dbConn()

    try {
      const result = await conn.query('select * from WorkspaceCategories order by id desc')
      conn.close()
      return result.recordset
    } catch (err) {
      return void console.log(`query error: ${err}`) || []
    }
  }
}