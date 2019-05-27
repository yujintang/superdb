const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.exists('tb_example', {
    where: {
      name: 'super1',
    },
  });
  console.log(result);
};

run();
