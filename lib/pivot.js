const _ = require('lodash');

const Chain = require('./chain');
const Mysql = require('./dialect/mysql');
const Op = require('./op');


class Pivot extends Chain {
  constructor(superdb) {
    super(superdb.options);
    this.Op = new Op();
    this.superdb = superdb;
    this.config = superdb.config;
    this.options = superdb.options;
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

  query(...args) {
    return this.conn.query(...args);
  }

  execute(...args) {
    return this.conn.execute(...args);
  }

  async find(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(options);
    const sql = this.transferData('select', data);
    const [result] = await this.query(sql);
    return result;
  }

  async findAndCountAll(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(options);
    const findData = await this.find(tbName, data);
    const countData = await this.count(tbName, data);
    return [findData, countData];
  }

  async findOne(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(Object.assign(options, _.pick(this.initialBody, ['offset', 'order']), { limit: 1 }));
    const sql = this.transferData('select', data);
    const [result] = await this.query(sql);
    return result[0];
  }

  async count(tbName, options) {
    this.table(tbName);
    const data = this.mergeBodyData(Object.assign(options, _.pick(this.initialBody, ['offset', 'order']), { select: 'COUNT(*) AS COUNT', limit: -1 }));
    const sql = this.transferData('select', data);
    const [result] = await this.query(sql);
    return result;
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
