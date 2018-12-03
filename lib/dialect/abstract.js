const _ = require('lodash');

const limitSymbol = Symbol('limit');
const offsetSymbol = Symbol('offset');
const tbNameSymbol = Symbol('tbname');

class Abstract {
  constructor() {
    this.sql = '';
    this.initialBody = {
      select: [],
      where: [],
      limit: limitSymbol,
      offset: offsetSymbol,
      tbName: tbNameSymbol,
    };
    this.body = _.cloneDeep(this.initialBody);
  }

  select(attr) {
    if (_.isArray(attr)) {
      this.body.concat(attr);
    } else if (_.isString(attr)) {
      this.body.select.concat(_.map(_.split(attr, ','), _.trim));
    } else {
      throw new Error('Select function params must String or Array!');
    }
    return this;
  }

  limit(limit, offset) {
    if (_.isNumber(limit) && limit > 0) {
      this.body.limit = limit;
    }
    this.offset(offset);
    return this;
  }

  offset(offset) {
    if (_.isNumber(offset) && offset > 0) {
      this.body.offset = offset;
    }
    return this;
  }

  _transferSql(tbName, params = this.body) {
    let sql = '';

    // select
    if (params.select.length > 0) {
      sql += ` select ${params.select.join(',')} from ${tbName} `;
    } else {
      sql += ` select * from ${tbName} `;
    }

    // limit
    if (params.select.limit !== limitSymbol) {
      sql += ` limit ${params.limit} `;
    }

    // offset
    if (params.select.limit !== limitSymbol) {
      sql += ` offset ${params.offset} `;
    }

    return sql;
  }
}

module.exports = Abstract;
