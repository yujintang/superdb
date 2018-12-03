const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const Abstract = require('./abstract');

class MysqlDialecte extends Abstract {
  constructor(easydb) {
    super();
    this.easydb = easydb;
    this.config = easydb.config;
    this.options = easydb.options;
    this.mysql = this.options.promise ? mysqlPromise : mysql;
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

  async find(tbName) {
    this.sql = this._transferSql(tbName, this.body);
    console.log(this.sql);
    const result = await this.execute(this.sql);
    return result[0];
  }
}

module.exports = MysqlDialecte;
