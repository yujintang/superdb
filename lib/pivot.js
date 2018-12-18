const _ = require('lodash');

const Chain = require('./chain');
const Mysql = require('./dialect/mysql');
const Op = require('./op');
const Cache = require('../lib/cache/index');


class Pivot extends Chain {
  constructor(superdb) {
    super(superdb.options);
    this.Op = new Op();
    this.superdb = superdb;
    this.config = superdb.config;
    this.options = superdb.options;
    this.createCache();
  }

  async createConn() {
    let dialect;
    switch (this.options.dialect) {
      case 'mysql':
        dialect = new Mysql(this.config, this.options);
        break;
      default:
        throw new Error('options.dialect config must in ["mysql"]');
    }
    this.conn = await dialect.createConn();
    return this;
  }

  createCache() {
    if (this.options.redis.cache) {
      this.cache = new Cache(this.options.redis);
    }
  }

  query(...args) {
    return this.conn.query(...args);
  }

  async cacheQuery(sql, ttl) {
    if (this.cache) {
      const result = await this.cache.getCache(sql);
      if (result) {
        if (this.options.logging) console.info('superdb cache: Point cache!');
        return result;
      }
    }
    const result = await this.conn.query(sql);
    if (this.cache) {
      this.cache.setCache(sql, result, ttl);
    }
    if (this.options.logging) console.info('superdb cache: Not point cache!');
    return result;
  }

  async find(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(options);
    const sql = this.transferData('select', data);
    const [result] = await this.cacheQuery(sql, data.ttl);
    return result;
  }

  async findAndCountAll(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(options);
    const findData = await this.find(tbName, data);
    const countData = await this.count(tbName, data);
    return { list: findData, count: countData };
  }

  async findOne(tbName, options) {
    const result = await this.find(tbName, Object.assign({}, options, { limit: 1 }));
    return result[0];
  }

  async count(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(Object.assign({ ttl: -1 }, options, _.pick(this.initialBody, ['offset', 'order', 'group']), { select: 'COUNT(*) AS COUNT', limit: -1 }));
    const sql = this.transferData('select', data);
    const [result] = await this.cacheQuery(sql, data.ttl);
    return result[0].COUNT;
  }

  async exists(tbName, whereParams, options = {}) {
    const result = await this.count(tbName, _.merge({ where: whereParams }, options));
    return !!result;
  }

  async create(tbName, insertParams) {
    this.table(tbName);
    this.insertBody(insertParams);
    const data = this.mergeBodyData();
    this.sql = this.transferData('insert', data);
    const [result] = await this.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }

  async update(tbName, updateObj, updateparams) {
    this.table(tbName);
    this.updateBody(updateObj);
    const data = this.mergeBodyData(updateparams);
    this.sql = this.transferData('update', data);
    const [result] = await this.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }

  async delete(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(options);
    const sql = this.transferData('delete', data);
    const [result] = await this.query(sql);
    return _.get(result, 'affectedRows', null);
  }
}


module.exports = Pivot;
