const assert = require('assert');
const { describe, it } = require('mocha');
const QG = require('../lib/queryGenerator');

describe('queryGenerator test', () => {
  describe('tableSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.tableSql('tb_example'), 'tb_example ');
    });
  });
  describe('updateSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.updateSql({ id: 100, name: 'qtds' }), "SET id = 100 , name = 'qtds' ");
    });
  });
  describe('insertSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.insertSql([{ id: 100, name: 'qtds' }, { id: 101, name: 'superdb' }]), "(id,name) values (100, 'qtds'), (101, 'superdb') ");
    });
  });
  describe('selectSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.selectSql(['id', 'name']), 'SELECT id, name ');
    });
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.selectSql([]), 'SELECT * ');
    });
  });
  describe('orderSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.orderSql(['name desc']), 'ORDER BY name desc ');
    });
  });
  describe('groupSql', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.groupSql(['name desc', 'id asc']), 'GROUP BY name desc, id asc ');
    });
  });
  describe('having', () => {
    it('should return true', () => {
      const qg = new QG();
      assert.equal(qg.havingSql(['count > 4', 'count < 6']), 'HAVING count > 4 AND count < 6 ');
    });
  });
  describe('offsetSql', () => {
    it('-1 should equal ""', () => {
      const qg = new QG();
      assert.equal(qg.offsetSql(-1), '');
    });
    it('int and > 0 should enable', () => {
      const qg = new QG();
      assert.equal(qg.offsetSql(10), 'OFFSET 10 ');
    });
  });
  describe('limitSql', () => {
    it('-1 should equal ""', () => {
      const qg = new QG();
      assert.equal(qg.limitSql(-1), '');
    });
    it('int and > 0 should enable', () => {
      const qg = new QG();
      assert.equal(qg.limitSql(10), 'LIMIT 10 ');
    });
  });
  describe('whereSql', () => {
    const qg = new QG();
    const sql = qg.whereSql({
      a: 1,
      b: 'q',
      c1: qg.Op.literal("c = 'qwe'"),
      d: qg.Op.between([2, 100]),
      [qg.Op.or]: {
        e: 1,
        f: 4,
      },
      g: 'finished',
    });
    assert.equal(sql, "WHERE (e = 1 OR f = 4) AND a = 1 AND b = 'q' AND c = 'qwe' AND d BETWEEN 2 AND 100 AND g = 'finished' ");
  });
});
