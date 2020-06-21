// 这是后端项目的公共资源
// 定义一个全局的图片前缀路径
exports.staticPath = process.env.NODE_ENV = 'production' ? '/' : "http://127.0.0.1:3000/";
//线上环境直接使用 / ，因为静态资源在同一端口下