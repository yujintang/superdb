const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.count('tb_example', {
    select: ['id', 'name'],
    where: {
      name: 'superdb',
    },
    logging: true,
  });
  console.log(result);
};

run();
