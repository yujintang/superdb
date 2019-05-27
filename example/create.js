const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.bulkCreate('tb_example', [{ name: 'super1' }, { name: 'super2' }], { logging: true });
  console.log(result);
};

run();
