const _ = require('lodash');

const splitStrFunc = Symbol('splitStrFunc');
const QueryGenerator = require('./queryGenerator');

class Chain {
  constructor(options = {}) {
    this.options = options;
    this.initialBody = {
      table: undefined,
      select: [],
      join: [],
      where: {},
      group: [],
      having: [],
      order: [],
      updateBody: {},
      insertBody: [],
      limit: options.maxLimit,
      offset: undefined,
      logging: options.logging,
      ttl: options.redis.ttl,
    };
    this.body = _.cloneDeep(this.initialBody);
    this.literalSymbol = Symbol.for('literal');
  }

  table(tbName) {
    // if (tbName === undefined) return this;
    if (_.isArray(tbName) && tbName.length > 0) {
      const alias = tbName[1] ? ` AS ${tbName[1]}` : '';
      this.body.table = `${tbName[0]}${alias}`;
    } else if (_.isString(tbName)) {
      this.body.table = _.escape(tbName);
    } else {
      throw new Error('Table Name must Array and array.length > 0 or String!');
    }
    return this;
  }

  /**
     * select attr 参数必须为str 或者 []
     * @param {*} attr
     */
  select(param) {
    if (param === undefined) return this;
    if (_.isArray(param)) {
      this.body.select = this.body.select.concat(param);
    } else if (_.isString(param)) {
      this.body.select.push(param);
    } else {
      throw new Error('Select function params must String or Array!');
    }
    return this;
  }

  /**
   * update
   * @param {*} param
   */
  updateBody(param) {
    if (param === undefined) return this;
    if (_.isObject(param)) {
      _.merge(this.body.updateBody, param);
    } else {
      throw new Error('UpdateBody function params must Object!');
    }
    return this;
  }

  insertBody(param) {
    if (param === undefined) return this;
    if (_.isObject(param)) {
      this.body.insertBody = this.body.insertBody.concat(param);
    } else {
      throw new Error('insertBody function params must Object!');
    }
    return this;
  }


  /**
   * where
   * @param {*} param
   */
  where(param) {
    if (param === undefined) return this;
    if (_.isObject(param)) {
      Object.assign(this.body.where, param);
    } else {
      throw new Error('Where function params must Object!');
    }
    return this;
  }

  join(param) {
    if (param === undefined) return this;
    let arr = [];
    if (_.isArray(param)) {
      arr = arr.concat(param);
    } else if (_.isObject(param)) {
      arr.push(param);
    } else {
      throw new Error('Join function params must Object or Array!');
    }
    const newArr = arr.map((v) => {
      const value = v;
      if (!value.table || !value.on) {
        throw new Error('Join function must contain table and on keys!');
      }
      if (value.direction && !['left', 'right', 'inner', 'full'].includes(value.direction)) {
        throw new Error("Join function direacton key should in ['left', 'right', 'inner', 'full']");
      }
      return value;
    });
    this.body.join = this.body.join.concat(newArr);
    return this;
  }

  limit(param) {
    if (param === undefined) return this;
    if (_.isInteger(+param)) {
      this.body.limit = +param;
    } else if (_.isArray(param)) {
      const [limit, offset] = param;
      this.limit(limit);
      this.offset(offset);
    } else {
      throw new Error('Limit function must integer or array!');
    }
    return this;
  }

  offset(param) {
    if (param === undefined) return this;
    if (_.isInteger(+param)) {
      this.body.offset = +param;
    } else {
      throw new Error('offset function must integer!');
    }
    return this;
  }


  order(attr) {
    if (attr === undefined) return this;
    return this[splitStrFunc]('order', attr);
  }

  group(attr) {
    if (attr === undefined) return this;
    return this[splitStrFunc]('group', attr);
  }

  having(attr) {
    if (attr === undefined) return this;
    return this[splitStrFunc]('having', attr);
  }

  logging(logging) {
    if (logging === undefined) return this;
    this.body.logging = !!logging;
    return this;
  }

  ttl(ttl) {
    if (ttl === undefined) return this;
    if (_.isNumber(ttl)) {
      this.body.ttl = ttl;
    }
    return this;
  }

  /**
   * private 用来将字符串或数组添加到对应的body数组中
   * @param {*} funcName 方法名
   * @param {*} params 参数
   */
  [splitStrFunc](funcName, params) {
    if (_.isArray(params)) {
      this.body[funcName] = this.body[funcName].concat(params);
    } else if (_.isString(params)) {
      this.body[funcName] = this.body[funcName].concat(_.map(_.split(params, ','), _.trim));
    } else {
      throw new Error(`Params ${params} Must String or Array!`);
    }
    return this;
  }

  transferData(actionType, params) {
    // 链式操作与function 参数一起作用
    this.resetBodyData();
    this
      .table(params.table)
      .select(params.select)
      .updateBody(params.updateBody)
      .insertBody(params.insertBody)
      .where(params.where)
      .join(params.join)
      .limit(params.limit)
      .offset(params.offset)
      .order(params.order)
      .group(params.group)
      .having(params.having)
      .logging(params.logging)
      .ttl(params.ttl);
    const queryGenerator = new QueryGenerator(this.body);
    const sql = queryGenerator.transferSqlFunc(actionType);
    this.resetBodyData();
    return sql;
  }

  resetBodyData() {
    this.body = _.cloneDeep(this.initialBody);
  }

  mergeBodyData(source = {}) {
    const result = {};
    _.merge(result, this.body, source);
    Object.assign(result.where, this.body.where, source.where);
    return result;
  }
}

module.exports = Chain;
