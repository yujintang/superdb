const _ = require('lodash');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const Abstract = require('./abstract');

const transferSqlFunc = Symbol('transferSqlFunc');
const selectSql = Symbol.for('selectSql');
const orderSql = Symbol.for('orderSql');
const groupSql = Symbol.for('groupSql');
const havingSql = Symbol.for('havingSql');
const offsetSql = Symbol.for('offsetSql');
const limitSql = Symbol.for('limitSql');
const whereSql = Symbol.for('whereSql');
const joinSql = Symbol.for('joinSql');
const insertSql = Symbol.for('insertSql');
const updateSql = Symbol.for('updateSql');


class MysqlDialecte extends Abstract {
  constructor(easydb) {
    super();
    this.easydb = easydb;
    this.config = easydb.config;
    this.options = easydb.options;
    this.mysql = this.options.promise ? mysqlPromise : mysql;
    this.sql = '';
    this.escape = this.mysql.escape;
    this.get = this.find;
    this.findOne = this.find;
    this.bulkCreate = this.create;
    this.insert = this.create;
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
    this.sql = this[transferSqlFunc]('select', tbName);
    const [result] = await this.conn.query(this.sql);
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

  /**
   * private 用来生成sql语句
   * @param {} method in ['select', 'insert', 'update', 'delete']
   * @param {*} tbName 表名
   * @param {*} params body参数
   */
  [transferSqlFunc](method, tbName, params = this.body) {
    let sql = '';
    switch (method) {
      case 'select':
        sql
          += `${this[selectSql]()
          }from ${tbName} ${this[joinSql]()
          }${this[whereSql]()
          }${this[groupSql]()
          }${this[havingSql]()
          }${this[orderSql]()
          }${this[limitSql]()
          }${this[offsetSql]()}`;
        break;
      case 'insert':
        sql
          += `INSERT INTO ${tbName} ${this[insertSql]()}`;
        break;
      case 'delete':
        sql
          += `DELETE from ${tbName} ${this[whereSql]()} ${this[limitSql]()}`;
        break;
      case 'update':
        sql
          += `UPDATE ${tbName} SET ${this[updateSql]()} ${this[whereSql]()} ${this[orderSql]()} ${this[limitSql]()}`;
        break;
      default:
        break;
    }
    if (this.options.logging) console.info(sql);
    return sql;
  }

  [updateSql](params = this.body.update) {
    let sql = '';
    let paramsCount = Object.keys(params).length;
    Object.entries(params).map(([key, value]) => {
      paramsCount -= 1;
      sql += `${key} = ${this.escape(value)}`;
      if (paramsCount !== 0) {
        sql += ' , ';
      } else {
        sql += ' ';
      }
      return true;
    });
    return sql;
  }

  [insertSql](params = this.body.insert) {
    let sql = '';
    let keys = [];
    const values = [];

    // todo 插入多条时，必须保证key值相等
    keys = Object.keys(params[0]);
    params.map((v) => {
      const tempValues = [];
      keys.map((key) => {
        tempValues.push(this.escape(v[key]) || 'NULL');
        return true;
      });
      values.push(`(${tempValues.join(', ')})`);
      return true;
    });

    sql += `(${keys}) values ${values.join(', ')}`;

    return sql && `${sql} `;
  }

  [selectSql](param = this.body.select) {
    let sql = '';
    if (param.length > 0) {
      sql += `select ${param.join(', ')}`;
    } else {
      sql += 'select *';
    }
    return sql && `${sql} `;
  }

  /**
   * order sql
   * @param {*} param
   */
  [orderSql](param = this.body.order) {
    let sql = '';
    if (param.length > 0) {
      sql += `ORDER BY ${param.join(', ')}`;
    }
    return sql && `${sql} `;
  }

  /**
   * group sql
   * @param {*} param
   */
  [groupSql](param = this.body.group) {
    let sql = '';
    if (param.length > 0) {
      sql += `GROUP BY ${param.join(', ')}`;
    }
    return sql || `${sql} `;
  }

  /**
   * having sql
   * @param {*} param
   */
  [havingSql](param = this.body.having) {
    let sql = '';
    if (param.length > 0) {
      sql += `HAVING ${param.join(', ')}`;
    }
    return sql && `${sql} `;
  }

  /**
   * offset sql
   * @param {*} params
   */
  [offsetSql](params = this.body.offset) {
    let sql = '';
    if (params !== this.initialBody.offset) {
      sql += `OFFSET ${params}`;
    }
    return sql && `${sql} `;
  }

  /**
   * limit sql
   * @param {*} param
   */
  [limitSql](params = this.body.limit) {
    let sql = '';
    if (params !== this.initialBody.limit) {
      sql += `LIMIT ${params}`;
    }
    return sql && `${sql} `;
  }

  /**
   * where sql
   * @param {*} params
   */
  [whereSql](params = this.body.where) {
    let sql = '';
    let paramsCount = Object.keys(params).length;
    Object.entries(params).map(([key, value]) => {
      paramsCount -= 1;
      if (value === this.body.whereStrSymbol) {
        sql += `${key}`;
      } else if (_.isObject(value)) {
        let opCount = Object.keys(value).length;
        Object.entries(value).map(([op, opResult]) => {
          opCount -= 1;
          sql += `${key} ${this.OperatorHelpers[op]} ${opResult}`;
          if (opCount !== 0) {
            sql += ' AND ';
          } else {
            sql += ' ';
          }
          return true;
        });
      } else {
        sql += `${key} = ${value}`;
      }
      if (paramsCount !== 0) {
        sql += ' AND ';
      } else {
        sql += ' ';
      }
      return true;
    });
    if (sql.length !== 0) sql = `WHERE ${sql}`;

    return sql && `${sql} `;
  }

  /**
   * join sql
   * @param {*} params
   */
  [joinSql](params = this.body.join) {
    let sql = '';
    Object.values(params).map((join) => {
      sql += `${join.direction} JOIN ${join.table} ON ${join.relation}`;
      return true;
    });
    return sql && `${sql} `;
  }
}

module.exports = MysqlDialecte;
