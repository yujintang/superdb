const Mysql = require('./dialect/mysql');

class Easydb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: options.pool !== false,
      promise: options.promise !== false,
    };
    switch (this.options.dialect) {
      case 'mysql':
        this.dialect = new Mysql(this);
        break;
      default:
        throw new Error('options.dialect config must in ["mysql"]');
    }
  }

  async createConn() {
    this.conn = await this.dialect.createConn();
    return this.conn;
  }
}

module.exports = Easydb;
