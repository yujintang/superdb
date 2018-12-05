const _ = require('lodash');

const splitStrFunc = Symbol('splitStrFunc');
const QueryGenerator = require('./queryGenerator');

class Chain {
  constructor(options) {
    this.options = options;
    this.baseBody = {
      table: undefined,
      select: [],
      join: [],
      where: {},
      group: [],
      having: [],
      order: [],
      limit: -1,
      offset: -1,
    };
    this.body = _.cloneDeep(this.baseBody);
    this.literalSymbol = Symbol.for('literal');
  }

  table(tbName) {
    if (tbName === undefined) return this;
    if (!_.isString(tbName)) {
      throw new Error('Table Name must string!');
    }
    this.body.table = _.escape(tbName);
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
    if (_.isInteger(+param) && +param >= 0) {
      this.body.limit = +param;
    } else if (_.isArray(param)) {
      const [limit, offset] = param;
      this.limit(limit);
      this.offset(offset);
    } else {
      throw new Error('Limit function must integer and >=0 or array!');
    }
    return this;
  }

  offset(param) {
    if (param === undefined) return this;
    if (_.isInteger(+param) && +param >= 0) {
      this.body.offset = +param;
    } else {
      throw new Error('offset function must integer and >=0!');
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

  transferData(tbName, source) {
    // 链式操作与function 参数一起作用
    const params = _.cloneDeep(Object.assign({}, this.body, source));
    this
      .table(tbName)
      .select(params.select)
      .where(params.where)
      .join(params.join)
      .limit(params.limit)
      .offset(params.offset)
      .order(params.order)
      .group(params.group)
      .having(params.having);
    const tempData = _.cloneDeep(this.body);
    this.resetBodyData();
    const queryGenerator = new QueryGenerator(tempData, this.options);
    const sql = queryGenerator.transferSqlFunc('select');
    return sql;
  }

  resetBodyData() {
    this.body = _.cloneDeep(this.baseBody);
  }
}

module.exports = Chain;
