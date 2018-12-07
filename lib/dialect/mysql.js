const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');

class MysqlDialect {
  constructor(config, options) {
    this.config = config;
    this.options = options;
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
}

module.exports = MysqlDialect;
