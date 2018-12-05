const _ = require('lodash');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const Chain = require('./chain');

const transferSqlFunc = Symbol('transferSqlFunc');

class MysqlDialect extends Chain {
  constructor(easydb) {
    super();
    this.easydb = easydb;
    this.config = easydb.config;
    this.options = easydb.options;
    this.mysql = this.options.promise ? mysqlPromise : mysql;
    this.sql = '';
    this.escape = this.mysql.escape;
  }

  async createConn() {
    this.conn = this.options.pool ? await this.mysql.createPool(this.config) : await this.mysql.createConnection(this.config);
    return this;
  }

  query(...args) {
    return this.conn.query(...args);
  }

  execute(...args) {
    return this.conn.execute(...args);
  }

  async find(tbName, options = {}) {
    const sql = this.transferData(tbName, options);
    const [result] = await this.query(sql);
    return result;
  }

  async create(tbName, params) {
    this.body.insert = _.concat(this.body.insert, params);
    this.sql = this[transferSqlFunc]('insert', tbName);
    await this.conn.query(this.sql);
    return true;
  }

  async update(tbName, params) {
    this.body.update = _.merge(this.body.update, params);
    this.sql = this[transferSqlFunc]('update', tbName);
    const [result] = await this.conn.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }

  async delete(tbName) {
    this.sql = this[transferSqlFunc]('delete', tbName);
    const [result] = await this.conn.query(this.sql);
    return _.get(result, 'affectedRows', null);
  }
}

module.exports = MysqlDialect;
