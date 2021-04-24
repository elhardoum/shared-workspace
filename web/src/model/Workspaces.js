module.exports = new class Workspaces
{
  COLUMNS = [ 'id', 'propertyid', 'categoryid', 'title', 'capacity', 'smoking', 'available', 'term', 'price', 'renterid', 'listed' ]

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
        left join WorkspaceCategories c on c.id = w.categoryid
        left join Users u on u.id = w.renterid
        where w.${field} = @value`)
      conn.close()

      return results.recordset.map(this.parse)
    } catch (err) {
      return void console.log(`query error: ${err}`)
    }
  }

  async query({
    fields={},
    limit=null,
    search=null,
    orderby='id',
    order='desc',
    available_gte, available_lte,
    address_search,
    capacity_min,
    price_min, price_max,
    sqft_min, sqft_max,
    garage, publictransportation,
    property_listed,
  })
  {
    const conn = await Util.dbConn()
        , sql = require('mssql')
        , req = new sql.Request(conn)
    
    let stmt = `select ${limit ? `top ${limit} ` : ''}
      w.*,
      c.name as categoryname,
      u.email as renteremail, u.name as rentername, u.phone as renterphone,
      p.title as propertytitle, p.address, p.squareft, p.garage, p.publictransportation, p.listed as propertylisted
     from Workspaces w`
      , where = ` where 1=1`

    for ( let field in fields ) {
      if ( -1 == this.COLUMNS.indexOf(field) )
        continue

      if ( null === fields[field] ) {
        where += ` and w.${field} is null`
      } else {
        where += ` and w.${field} = @${field}`
        req.input(field, fields[field])
      }
    }

    if ( search ) {
      where += ' and (w.title like @title_search)'
      req.input('title_search', `%${search}%`)
    }

    if ( address_search ) {
      where += ' and (p.address like @address_search)'
      req.input('address_search', `%${address_search}%`)
    }

    if ( available_gte ) {
      where += ' and w.available >= @available_gte'
      req.input('available_gte', available_gte)
    }

    if ( available_lte ) {
      where += ' and w.available <= @available_lte'
      req.input('available_lte', available_lte)
    }

    if ( capacity_min ) {
      where += ' and w.capacity >= @capacity_min'
      req.input('capacity_min', capacity_min)
    }

    if ( price_min ) {
      where += ' and w.price >= @price_min'
      req.input('price_min', price_min)
    }

    if ( price_max ) {
      where += ' and w.price <= @price_max'
      req.input('price_max', price_max)
    }

    if ( sqft_min ) {
      where += ' and p.squareft >= @sqft_min'
      req.input('sqft_min', sqft_min)
    }

    if ( sqft_max ) {
      where += ' and p.squareft <= @sqft_max'
      req.input('sqft_max', sqft_max)
    }

    if ( undefined !== garage ) {
      where += ' and p.garage = @garage'
      req.input('garage', !!garage)
    }

    if ( undefined !== publictransportation ) {
      where += ' and p.publictransportation = @publictransportation'
      req.input('publictransportation', !!publictransportation)
    }

    if ( undefined !== property_listed ) {
      where += ' and p.listed = @property_listed'
      req.input('property_listed', !!property_listed)
    }

    stmt += ` left join WorkspaceCategories c on c.id = w.categoryid`
    stmt += ` left join Users u on u.id = w.renterid`
    stmt += ` left join Properties p on p.id = w.propertyid`
    stmt += where

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

  async create( propertyid, categoryid, title, capacity, smoking, available, term, price, renterid=null, listed=true )
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
      req.input('listed', listed)

      const status = await req.query(`insert into Workspaces (propertyid, categoryid, title, capacity, smoking, available, term, price, renterid, listed)
        values (@propertyid, @categoryid, @title, @capacity, @smoking, @available, @term, @price, @renterid, @listed)`)
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