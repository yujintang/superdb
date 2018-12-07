# superdb
better and easy db(mysql...) tools for node.js

## TODO
- [ ] doc
- [ ] test
- [ ] postgresqls
- [ ] add cache 

__Table of contents__
- [Installation](#installation)
- [QuickStart](#quickStart)
- [Connection](#connection)

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
      name: conn.Op.is(null),
    },
    limit: 5,
  });
  console.log(result);
};
main();

// SELECT id, name FROM tb_example WHERE id = 1 AND name IS null LIMIT 5
```
### Connection
```js
const db = new Superdb(config, options);
const conn = await db.createConn();
```
#### config

```js
// 1
config = {
  connectionLimit : 10,
  host              : 'localhost',
  port              : '3306',
  user              : 'root',
  password          : 'password',
  database          : 'example'
}

// 2
config = 'mysql://user:password@host:post/database'
```
#### options
```js
options = {
    dialect         : 'mysql',  // which db? default: "mysql",
    pool            : true,     // connection pool ? default true
    promise         : true      // using promise async/await ? default true
    logging         : false,    // print sql ? default false
}
```
### Conn methods
* query
```js
const result = await conn.query(sql)
```
* execute
```js
const result = await conn.execute(sql)
```
* find
```js
const result = await conn.find(tbName, findOptions);
```
* create
```js
const result = await conn.create(tbName, createParams);
```
* update
```js
const result = await conn.update(tbName, updateOptions);
```
* delete
```js
const result = await conn.delete(tbName, deleteOptions)
```