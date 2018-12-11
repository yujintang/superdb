const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.find('tb_example', {
    select: ['id', 'name'],
    where: {
      name: 'superdb',
    },
    logging: true,
    ttl: 60,
  });
  console.log(result);
};

run();
