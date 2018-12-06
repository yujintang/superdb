const _ = require('lodash');
const { Op } = require('./op');

const limitSymbol = Symbol('limit');
const offsetSymbol = Symbol('offset');
const tbNameSymbol = Symbol('tbname');
const splitStrFunc = Symbol('splitStrFunc');
const whereKvFunc = Symbol('whereStrFunc');
const whereObjFunc = Symbol('whereStrFunc');

class Abstract {
  constructor() {
    this.Op = Op;
    this.initialBody = {
      select: [],
      join: [],
      where: {}, // key value where like {key: value, key1: {[>]: 5}}
      whereStrSymbol: Symbol('whereStr'), // str where 标记
      update: {},
      insert: [],
      group: [],
      order: [],
      having: [],
      limit: limitSymbol,
      offset: offsetSymbol,
      tbName: tbNameSymbol,
    };
    this.body = _.cloneDeep(this.initialBody);
  }

  select(attr) {
    if (_.isArray(attr)) {
      this.body.select = this.body.select.concat(attr);
    } else if (_.isString(attr)) {
      this.body.select = this.body.select.concat(_.map(_.split(attr, ','), _.trim));
    } else {
      throw new Error('Select function params must String or Array!');
    }
    return this;
  }

  where(key1, key2) {
    if (_.isObject(key1) && _.isUndefined(key2)) {
      return this[whereObjFunc](key1);
    }
    if (_.isString(key1)) {
      return this[whereKvFunc](key1, key2);
    }
    throw new Error('Where function Params Error!');
  }

  [whereKvFunc](key, value) {
    let newValue = value;
    if (_.isUndefined(newValue)) {
      newValue = this.body.whereStrSymbol;
    }
    if (_.isArray(value)) {
      newValue = { [this.Op.in]: value };
    }
    Object.assign(this.body.where, { [`${key}`]: newValue });
    return this;
  }

  [whereObjFunc](object) {
    Object.assign(this.body.where, object);
    return this;
  }


  join(tableName, relation, direction) {
    this.body.join.push({
      table: tableName,
      relation,
      direction: ['left', 'right', 'inner', 'full'].includes(direction) ? direction : 'left',
    });
    return this;
  }

  limit(limit, offset) {
    if (_.isNumber(limit) && limit > 0) {
      this.body.limit = limit;
    }
    this.offset(offset);
    return this;
  }

  offset(attr) {
    if (_.isNumber(attr) && attr > 0) {
      this.body.offset = attr;
    }
    return this;
  }

  order(attr) {
    return this[splitStrFunc]('order', attr);
  }

  group(attr) {
    return this[splitStrFunc]('group', attr);
  }

  having(attr) {
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
}

module.exports = Abstract;
