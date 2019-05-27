const _ = require('lodash');

const splitStrFunc = Symbol('splitStrFunc');
const QueryGenerator = require('./queryGenerator');
const { jsType } = require('./utils/helper');

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
      limit: undefined,
      offset: undefined,
      logging: options.logging,
      logger: options.logger,
      ttl: undefined,
    };
    this.body = _.cloneDeep(this.initialBody);
    this.lastData = undefined;
    this.literalSymbol = Symbol.for('literal');
  }

  table(tbName) {
    if (tbName === undefined) return this;
    if (jsType('String')(tbName)) {
      this.body.table = _.escape(tbName);
    } else {
      throw new Error('superdb err: Table Name must String!');
    }
    return this;
  }

  /**
     * select attr 参数必须为str 或者 []
     * @param {*} attr
     */
  select(param) {
    if (param === undefined) return this;
    if (jsType('Array')(param)) {
      this.body.select = this.body.select.concat(param);
    } else if (jsType('String')(param)) {
      this.body.select.push(param);
    } else {
      throw new Error('superdb err: Select function params must String or Array!');
    }
    return this;
  }

  /**
   * update
   * @param {*} param
   */
  updateBody(param) {
    if (param === undefined) return this;
    if (jsType('Object')(param)) {
      _.merge(this.body.updateBody, param);
    } else {
      throw new Error('superdb err: UpdateBody function params must Object!');
    }
    return this;
  }

  insertBody(param) {
    if (param === undefined) return this;
    if (jsType('Object')(param) || jsType('Array')(param)) {
      this.body.insertBody = this.body.insertBody.concat(param);
    } else {
      throw new Error('superdb err: insertBody function params must Object!');
    }
    return this;
  }


  /**
   * where
   * @param {*} param
   */
  where(param) {
    if (param === undefined) return this;
    if (jsType('Object')(param)) {
      Object.assign(this.body.where, param);
    } else {
      throw new Error('superdb err: Where function params must Object!');
    }
    return this;
  }

  join(param) {
    if (param === undefined) return this;
    let arr = [];
    if (jsType('Array')(param)) {
      arr = arr.concat(param);
    } else if (jsType('Object')(param)) {
      arr.push(param);
    } else {
      throw new Error('superdb err: Join function params must Object or Array!');
    }
    const newArr = arr.map((v) => {
      const value = v;
      if (!value.table || !value.on) {
        throw new Error('superdb err: Join function must contain table and on keys!');
      }
      if (value.direction && !['left', 'right', 'inner', 'full'].includes(value.direction)) {
        throw new Error(" superdb err: Join function direacton key should in ['left', 'right', 'inner', 'full']");
      }
      return value;
    });
    this.body.join = this.body.join.concat(newArr);
    return this;
  }

  limit(param) {
    if (param === undefined) return this;
    if (jsType('Integer')(+param)) {
      this.body.limit = +param;
    } else if (jsType('Array')(param)) {
      const [limit, offset] = param;
      this.limit(limit);
      this.offset(offset);
    } else {
      throw new Error('superdb err: Limit function must integer or array!');
    }
    return this;
  }

  offset(param) {
    if (param === undefined) return this;
    if (jsType('Integer')(+param)) {
      this.body.offset = +param;
    } else {
      throw new Error('superdb err: offset function must integer!');
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
    if (jsType('Number')(ttl)) {
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
    if (jsType('Array')(params)) {
      this.body[funcName] = this.body[funcName].concat(params);
    } else if (jsType('String')(params)) {
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
    if (!this.body.table) {
      throw new Error('superdb err: superdb err: Must input tbName!');
    }
    const queryGenerator = new QueryGenerator(this.body);
    const sql = queryGenerator.transferSqlFunc(actionType);
    this.resetBodyData();
    return sql;
  }

  resetBodyData() {
    this.body = _.cloneDeep(this.initialBody);
  }

  mergeBodyData(source = {}) {
    const result = _.merge({}, this.body, source);
    // beforeHooks
    for (const [key, func] of Object.entries(this.options.beforeHooks)) {
      if (jsType('Function')(func)) result[key] = func(result[key]);
    }
    Object.assign(result.where, this.body.where, source.where);
    this.lastData = result;
  }
}

module.exports = Chain;
