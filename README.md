# superdb
better and easy db(mysql...) tools for node.js

## TODO
- [ ] doc
- [ ] test
- [ ] postgresqls
- [ ] add cache 

__Table of contents__
- [Installation](###Installation)
- [QuickStart](###QuickStart)
- [Connection](###Connection)

### Installation
```
yarn add https://github.com/yujintang/superdb.git 
```
### QuickStart
```js
const Superdb = require('superdb');
const db = new Superdb('mysql://root:password@localhost/example', { logging: true });

const main = async () => {
  const conn = await db.createConn();
  const result = await conn.find('tb_example', {
    select: ['id', 'name'],
    where: {
      id: 1,
    },
    limit: 5,
  });
  console.log(result);
};
main();

// SELECT id, name FROM tb_example WHERE id = 1 AND name IS null LIMIT 5
```
### Connection