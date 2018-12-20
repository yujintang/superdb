const _ = require('lodash');

const Chain = require('./chain');
const Mysql = require('./dialect/mysql');
const Op = require('./op');
const Cache = require('../lib/cache/index');
const helper = require('./utils/helper');


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
    if (this.options.cache) {
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
        if (this.lastData.logging) console.info('superdb cache: Point cache!');
        return result;
      }
    }
    const result = await this.conn.query(sql);
    if (this.cache) {
      this.cache.setCache(sql, result, ttl);
    }
    if (this.lastData.logging) console.info('superdb cache: Not point cache!');
    return result;
  }

  async find(tbName, options) {
    this.table(tbName);
    this.mergeBodyData(options);
    const sql = this.transferData('select', this.lastData);
    const [result] = await this.cacheQuery(sql, this.lastData.ttl);
    return result;
  }

  async findAndCountAll(tbName, options) {
    this.table(tbName);
    this.mergeBodyData(options);
    const findData = await this.find(tbName, this.lastData);
    const countData = await this.count(tbName, this.lastData);
    return { list: findData, count: countData };
  }

  async findOne(tbName, options) {
    const result = await this.find(tbName, Object.assign({}, options, { limit: 1 }));
    return result[0];
  }

  async count(tbName, options) {
    this.table(tbName);
    this.mergeBodyData(Object.assign({ ttl: -1 }, options, _.pick(this.initialBody, ['offset', 'order', 'group']), { select: 'COUNT(*) AS COUNT', limit: -1 }));
    const sql = this.transferData('select', this.lastData);
    const [result] = await this.cacheQuery(sql, this.lastData.ttl);
    return result[0].COUNT;
  }

  async exists(tbName, options) {
    const result = await this.count(tbName, options);
    return !!result;
  }

  async create(tbName, insertParams, options) {
    this.table(tbName);
    this.insertBody(insertParams);
    this.mergeBodyData(options);
    this.sql = this.transferData('insert', this.lastData);
    const [result] = await this.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }

  async createOne(tbName, insertParams, options) {
    if (!helper.jsType('Object')(insertParams)) {
      throw new Error('superdb err: createOne params error! second params must {}');
    }
    return this.create(tbName, insertParams, options);
  }

  async bulkCreate(tbName, insertParams, options) {
    if (!helper.jsType('Array')(insertParams)) {
      throw new Error('superdb err: createOne params error! second params must []');
    }
    return this.create(tbName, insertParams, options);
  }

  async update(tbName, updateObj, options) {
    this.table(tbName);
    this.updateBody(updateObj);
    this.mergeBodyData(options);
    this.sql = this.transferData('update', this.lastData);
    const [result] = await this.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }

  async bulkUpdate(tbName, updateObj, options) {
    return this.update(tbName, updateObj, options);
  }

  async updateOne(tbName, updateObj, options = {}) {
    const tempOptions = Object.assign({}, options, { limit: 1 });
    return this.update(tbName, updateObj, tempOptions);
  }

  async delete(tbName, options) {
    this.table(tbName);
    this.mergeBodyData(options);
    const sql = this.transferData('delete', this.lastData);
    const [result] = await this.query(sql);
    return _.get(result, 'affectedRows', null);
  }
}


module.exports = Pivot;
