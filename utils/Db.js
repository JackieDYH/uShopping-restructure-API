const mysql = require("mysql");
const to = require("./awaitTo");
const pStr = process.env.NODE_ENV; // 线上环境值是prduction, 线下环境应该是development (线上/线下环境,这个值取到的是不一样的, 线上是在pm2.json中设置的, 线下的package.json中设置)

const dbConfig = {
    host: "127.0.0.1",
    port: "3306",
    user: pStr === 'production' ? 'dyh' : 'root',
    password: pStr === 'production' ? '!QAZ2wsx' : "root",
    database: "xiaou"
}

class Db {
    static connect() {// 数据库连接的动作
        this.con = mysql.createConnection(dbConfig);
        this.con.connect();
    }
    static operator(sqlStr) { // 此方法利用Promise把数据库的执行sql语句的异步代码封装进去
        return new Promise((resolve, reject) => {
            this.con.query(sqlStr, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    static async query(sqlStr) {// static修饰的方式里的this, 指向的是类
        return await to(this.operator(sqlStr));
    }
}

module.exports = Db; //导出封装的数据库操作类