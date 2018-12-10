const assert = require('assert');
const { describe, it } = require('mocha');

const Chain = require('../lib/chain');

describe('chain function test', () => {
  describe('table', () => {
    it('array params should return true', () => {
      const chain = new Chain();
      chain.table(['tb_example', 'exp']);
      assert.equal(chain.body.table, 'tb_example AS exp');
    });
  });
  describe('select', () => {
    it('array params should return true', () => {
      const chain = new Chain();
      chain.select(['id', 'name']);
      chain.select('age');
      assert.notStrictEqual(chain.body.select, ['id', 'name', 'age']);
    });
  });
  describe('updateBody', () => {
    it('object params should return true', () => {
      const chain = new Chain();
      chain.updateBody({ age: 18 });
      chain.updateBody({ name: 'qtds' });
      assert.notStrictEqual(chain.body.update, { age: 18, name: 'qtds' });
    });
  });
  describe('insertBody', () => {
    it('object or array params should return true', () => {
      const chain = new Chain();
      chain.insertBody({ age: 18 });
      chain.insertBody([{ age: 19 }]);
      assert.notStrictEqual(chain.body.insertBody, [{ age: 18 }, { age: 19 }]);
    });
  });
  describe('where', () => {
    it('object params should return true', () => {
      const chain = new Chain();
      chain.where({
        age: 18,
        name: 'qtds',
      });
      assert.notStrictEqual(chain.body.where, { age: 18, name: 'qtds' });
    });
  });
  describe('join', () => {
    it('array or object params should return true', () => {
      const chain = new Chain();
      chain.join({ table: 'tb_user', on: 'tb_user.id = tb_example.id' });
      chain.join([{ table: 'tb_user1', on: 'tb_user1.id = tb_example.id' }]);
      assert.notStrictEqual(chain.body.join, [{ table: 'tb_user', on: 'tb_user.id = tb_example.id' }, { table: 'tb_user1', on: 'tb_user1.id = tb_example.id' }]);
    });
    it('miss table will throw Error', () => {
      const chain = new Chain();
      assert.throws(() => {
        chain.join({ on: 'tb_user.id = tb_example.id' });
      }, Error);
    });
    it('miss on will throw Error', () => {
      const chain = new Chain();
      assert.throws(() => {
        chain.join({ table: 'tb_user' });
      }, Error);
    });
  });
  describe('limit', () => {
    it('array can set limit and offset', () => {
      const chain = new Chain();
      chain.limit([1, 100]);
      assert.equal(chain.body.limit, 1);
      assert.equal(chain.body.offset, 100);
    });
    it('if not int, will throw error', () => {
      const chain = new Chain();
      assert.throws(() => {
        chain.limit('asdf');
      }, Error);
    });
  });
  describe('order, group and having', () => {
    it('array or object params should return true', () => {
      const chain = new Chain();
      chain.order('name desc');
      chain.order(['age desc']);
      assert.notStrictEqual(chain.body.order, ['name desc', 'age desc']);
    });
  });
});
