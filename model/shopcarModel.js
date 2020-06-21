// 对应操作shopcar表的, 一个Model模块
// 只是把数据操作相关的代码, 封装进来 --- 数据模型 文件 (注意, 它会被routes/路由文件中去调用)
const Db = require("../utils/Db");
const {staticPath} = require("../common/global");
class shopCarModel {
    static async selectListByUid(uid) {
        let [err, arr] = await Db.query(`SELECT * FROM shopcar WHERE uid = '${uid}'`);
        // console.log(arr);
        // 购物车数组里, 每个购物车对象是shopCarObj, 都是独立的
        let newArr = arr.map(async shopCarObj => {
            let [err, goodsArr] = await Db.query(`SELECT goods_list.goods_name, goods_list.goods_price, CONCAT('${staticPath}', goods_image.file_name ) as file_name,goods_style.style_name,goods_style.style_value FROM (goods_list LEFT JOIN goods_image ON goods_list.goods_id = goods_image.goods_id) LEFT JOIN goods_style ON goods_list.goods_id = goods_style.goods_id
        WHERE goods_list.goods_id = '${shopCarObj['goods_id']}' LIMIT 0,1`);
            shopCarObj['goodsObj'] = goodsArr[0]; // 给每个购物车一条记录的对象, 扩展一个属性goodsObj(随便定义), 为了装它对应的商品和图片信息的
        });
        // 重要: 循环了7个async函数, 返回7个Promise对象(每个Promise内是一个换商品的sql动作)
        // Promise.all() 可以把多个promise对象, 合并成一个, await修饰这个大的
        await Promise.all(newArr);
        return arr;
    }
}

module.exports = shopCarModel;