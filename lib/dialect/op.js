const { isString } = require('lodash');

class Op {
  constructor() {
    this.or = Symbol.for('or');
    this.and = Symbol.for('and');
  }

  /**
   * 调用该方法，则直接拼接sql ，与key无关
   * @param {*} params
   */
  literal(params) {
    if (!isString(params)) {
      throw new Error('literal function must String!');
    }
    const result = params;
    return [this.pure, result];
  }

  isnull() {
    return [this.flag, 'ISNULL'];
  }
}
Op.pure = Symbol.for('pure');
Op.flag = Symbol.for('flag');

module.exports = Op;
