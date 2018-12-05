const _ = require('lodash');

class QueryGenerator {
  constructor(params, options) {
    this.options = options;
    this.params = Object.assign({}, params);
  }

  transferSqlFunc(method, tbName = this.params.table) {
    let sql = '';
    switch (method) {
      case 'select':
        sql
                    += `${this.selectSql()
          }from ${tbName} ${this.joinSql()
          }${this.whereSql()
          }${this.groupSql()
          }${this.havingSql()
          }${this.orderSql()
          }${this.limitSql()
          }${this.offsetSql()}`;
        break;
      case 'insert':
        sql
                    += `INSERT INTO ${tbName} ${this.insertSql()}`;
        break;
      case 'delete':
        sql
                    += `DELETE from ${tbName} ${this.whereSql()} ${this.limitSql()}`;
        break;
      case 'update':
        sql
                    += `UPDATE ${tbName} SET ${this.updateSql()} ${this.whereSql()} ${this.orderSql()} ${this.limitSql()}`;
        break;
      default:
        break;
    }
    if (this.options.logging) console.info(sql);
    return sql;
  }

  updateSql(params = this.params.update) {
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

  insertSql(params = this.params.insert) {
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

  /**
     * select sql
     * @param {*} param
     */
  selectSql(param = this.params.select) {
    let sql = '';
    if (param.length > 0) {
      sql += `SELECT ${param.join(', ')}`;
    } else {
      sql += 'SELECT *';
    }
    return sql && `${sql} `;
  }

  /**
         * order sql
         * @param {*} param
         */
  orderSql(param = this.params.order) {
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
  groupSql(param = this.params.group) {
    let sql = '';
    if (param.length > 0) {
      sql += `GROUP BY ${param.join(', ')}`;
    }
    return sql && `${sql} `;
  }

  /**
         * having sql
         * @param {*} param
         */
  havingSql(param = this.params.having) {
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
  offsetSql(param = this.params.offset) {
    let sql = '';
    if (param > 0) {
      sql += `OFFSET ${param}`;
    }
    return sql && `${sql} `;
  }

  /**
         * limit sql
         * @param {*} param
         */
  limitSql(param = this.params.limit) {
    let sql = '';
    if (param > 0) {
      sql += `LIMIT ${param}`;
    }
    return sql && `${sql} `;
  }

  /**
         * where sql
         * @param {*} params
         */
  whereSql(param = this.params.where) {
    let sql = '';
    let paramsCount = Object.keys(param).length;
    Object.entries(param).map(([key, value]) => {
      paramsCount -= 1;
      if (value === this.params.whereStrSymbol) {
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
  joinSql(params = this.params.join) {
    let sql = '';
    Object.values(params).map((join) => {
      sql += `${join.direction ? `${join.direction} ` : ''}JOIN ${join.table} ON ${join.on} `;
      return true;
    });
    return sql && `${sql}`;
  }
}

module.exports = QueryGenerator;
