var express = require('express');
var router = express.Router();
const url = require("url");
const Db = require("../utils/Db");
const Auth = require("../utils/auth");//生成/提取uid
const {staticPath} = require("../common/global");//图片统一前缀
const {Success,MError} = require("../utils/Result");// 引入统一返回的接口对象的生成方法
Db.connect();

//============地理位置接口
// 省份一级
router.get('/provincesList', async (req,res)=>{
  const [errObj,dataArr] = await Db.query("SELECT * FROM provinces");
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"地理位置查询成功"));
  // 因为返回给前端的数据, 尽量在一个对象中, 而且这个对象应该给一些提示文字, 所以Result.js里封装的就是这样的对象
  // 用法: 把数据传入进去(提示文字), Success方法会返回一个统一格式的对象, 然后再res.send() 返回给前端
})
// 省份二级
router.get('/CityList', async (req,res)=>{
  const {query:{pro_id}} = url.parse(req.url,true);
  const [errObj,dataArr] = await Db.query(`SELECT * FROM cities WHERE pro_id = ${pro_id}`);
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"地理位置查询成功"));
})
// 省份三级
router.get('/areasList', async (req,res)=>{
  const {query:{city_id}} = url.parse(req.url,true);
  const [errObj,dataArr] = await Db.query(`SELECT * FROM areas WHERE city_id = ${city_id}`);
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"地理位置查询成功"));
})

//===================页面头部 热门搜索类别
router.get("/hotSearchList",async (req,res)=>{
  const [errObj,dataArr] = await Db.query(`SELECT search_text FROM search ORDER BY count DESC LIMIT 0,8`);
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"热门搜索获取成功"));
})
//录入搜索关键词
router.post("/enterSearch",async (req,res)=>{
  //1先查询搜索关键词表中是否存在
  const [errObj,dataArr] = await Db.query(`SELECT * FROM search WHERE search_text = '${req.body.searchText}'`);
  if(errObj){
    res.send(MError("查询数据不存在"+errObj.toString()));
    return;
  }
  //存在 更新 否则 插入
  if(dataArr.length > 0){//存在
    const [errObj,obj] = await Db.query(`UPDATE search SET count = count + 1 WHERE search_text = '${req.body.searchText}'`);
    if(errObj || obj.affectedRows === 0)res.send(MError("更新失败"));
    else res.send(Success([], "更新成功"))
  }else{//不存在
    const [errObj,obj] = await Db.query(`INSERT INTO search VALUES(null,'${req.body.searchText}',1,${new Date().getTime()})`);
    if(errObj || obj.affectedRows === 0)res.send(MError("更新失败"));
    else res.send(Success([], "录入成功"))
  }// 注意: 中文需要加单引号
})// 注意: 错误可以在开发过程中, 避免, 如果是判断前端传递的参数错误的话, 可以写if判断

// 搜索+list数据铺设接口结果返回
router.get('/searchGoodsList',async (req,res)=>{
  let {query:{searchText, thired_id, page, everyNum, how = 'sell', asc = 'DESC'}} = url.parse(req.url, true);
  // how代表前端的排序条件 (sell:销量, new: 新品, price: 价格, eval: 评论数)
  // sell要联系order_v, eval要联系goods_eval
  console.log(searchText);
  let searchTextStr = '',orderStr = '',selectStr = '',joinStr = '',groupStr = '';
  if(searchText){
    searchTextStr = ` goods_list.goods_name LIKE '%${searchText}%' `;
  }else{
    searchTextStr = ` goods_list.thired_id = ${thired_id} `;
  }
  console.log(searchTextStr);
  if(how === 'new'){
    orderStr = ` ORDER BY new_status ${asc} `;
    // 降序排序, 值大的在前面
  }else if(how === 'price'){
    orderStr = ` ORDER BY goods_price ${asc} `;
    // 如果有多个条件同时排序, 那么就在字段后面逗号接着写字段, 然后会以多个字段组合的值来排序.
  }else if(how === 'sell'){
    selectStr = `, count(order_v.goods_id) as sellCount `;
    joinStr = ` LEFT JOIN order_v ON goods_list.goods_id = order_v.goods_id `;
    groupStr = ` GROUP BY goods_list.goods_id `;//分组
    orderStr = ` ORDER BY sellCount ${asc} `;//排序
  }else if(how === 'eval'){
    selectStr = `, count(goods_eval.goods_id) as evalCount `;
    joinStr = ` LEFT JOIN goods_eval ON goods_list.goods_id = goods_eval.goods_id `;
    groupStr = ` GROUP BY goods_list.goods_id `;
    orderStr = ` ORDER BY evalCount ${asc} `;
  }
  const [err,arr] = await  Db.query(`SELECT goods_list.goods_name,goods_list.thired_id, goods_list.goods_price, goods_list.goods_id, goods_list.new_status ${selectStr} FROM goods_list ${joinStr} WHERE ${searchTextStr} ${groupStr} ${orderStr} LIMIT ${(page - 1) * everyNum}, ${everyNum}`); // %是sql里的占位符, 代表可以匹配任意次任何字符
  
  console.log(`SELECT goods_list.goods_name,goods_list.thired_id, goods_list.goods_price, goods_list.goods_id, goods_list.new_status ${selectStr} FROM goods_list ${joinStr} WHERE ${searchTextStr} ${groupStr} ${orderStr} LIMIT ${(page - 1) * everyNum}, ${everyNum}`)
  // page = 1     想从0下标开始  (下标为0-15这些数据)
  // page = 2     想从16下标开始 (下标16-31这些数据)
  // page = 3     想从32开始
  // 用page怎么换算下标开始的位置的值?
  await Promise.all(arr.map(async goodsObj => {
    const [err, arr] = await Db.query(`SELECT CONCAT('${staticPath}', file_name) as file_name FROM goods_image WHERE goods_id = '${goodsObj['goods_id']}' LIMIT 0, 1`);// 限制查询图片只要第一张图 (arr是一个数组, 里面只有一个对象)
    goodsObj['imageUrl'] = arr[0]['file_name'];// 取出file_name的过程
  }));

  await Promise.all(arr.map(async goodsObj => { // 循环每个商品对象, 为每个商品对象去查询评论表里的数据条数, 把评论条数添加到此对象的evalNum属性上
    console.log("evalCount语句："+`SELECT count(*) as evalCount FROM goods_eval WHERE goods_id = '${goodsObj['goods_id']}'`)
    const [err, arr] = await Db.query(`SELECT count(*) as evalCount FROM goods_eval WHERE goods_id = '${goodsObj['goods_id']}'`);
    goodsObj['evalCount'] = arr[0]['evalCount'];
  }));

  let [err2, [{allCount}]] = await Db.query(`SELECT count(*) as allCount FROM goods_list WHERE ${searchTextStr}`); // 这里只查匹配的商品一共有多少件, 为了前端铺设共多少件商品的标签使用

  res.send(Success({ // 因为这次返回的数据字段有2个, 所以这里单独的再处理一下
    allCount,
    data: arr
  })); // 前端有总条数, 以及每页条数, 前端自己就能计算出一共能分多少页(注意向上取整)

})

//====================首页-轮播图接口
router.get('/bannerList',async (req,res)=>{
  // CONCAT的作用: 是在查询结果时, 给某个字段进行拼接值
  // CONCAT(在前面拼接的字符串, 查询的字段) as 给值起个别名
  const [err, arrObj] = await Db.query(`SELECT CONCAT('${staticPath}', coverimg) as coverimg FROM banner`);
  res.send(Success(arrObj));
})

//====================首页 全部商品一级分类
router.get('/firstCategory', async (req, res, next)=>{
  const [errObj,arrObj] = await Db.query("SELECT * FROM category_first LIMIT 0,20");//await 可以直接接受promise里的resolve的结果
  res.send(Success(arrObj));
});

//====================首页-限时秒杀
router.get('/flashList',async (req,res)=>{
  const [err, arrObj] = await Db.query(`SELECT flash_id, begintime, endtime FROM flash_sale ORDER BY begintime DESC LIMIT 0, 2`);
  // 再给每个秒杀活动, 添加对应的多件商品数据
  await Promise.all(arrObj.map(async flashObj=>{
    const [err, goodsArr] = await Db.query(`SELECT * FROM flash_product WHERE flash_id = '${flashObj['flash_id']}'`); // 查询此秒杀活动对应的所有商品数据
    // 但是每件商品对象, 需要商品图片, 商品名字, 商品原价格, 商品折扣价, 销量, 库存假设都是100件
    await Promise.all(goodsArr.map(async goodsObj=>{
      const [err,[goodsInfoObj]] = await Db.query(`SELECT goods_list.goods_id,goods_list.goods_name,goods_list.goods_price,goods_list.assem_price,sum(order_v.goods_count) as sellCount FROM goods_list LEFT JOIN order_v ON goods_list.goods_id = order_v.goods_id WHERE goods_list.goods_id = '${goodsObj['goods_id']}'`);
      const [err2,[{file_name}]] = await Db.query(`SELECT CONCAT('${staticPath}', file_name) as file_name FROM goods_image WHERE goods_id = '${goodsObj['goods_id']}' LIMIT 0, 1`); // 只查出来一张图片够用
      goodsInfoObj['fileName'] = file_name;
      goodsObj['goodsInfoObj'] = goodsInfoObj;
    }))
    flashObj['goodsArr'] = goodsArr;
  }))
  res.send(Success(arrObj));
})

//=====================首页 人气好货
router.get("/homeGoodEvalList", async (req, res) => {
  const [err, arr] = await Db.query(`SELECT goods_id, count(*) as goodEvalCount FROM goods_eval WHERE eval_start >= 3  GROUP BY goods_id ORDER BY goodEvalCount DESC  LIMIT 0, 8`);
  // 进一步处理数据, 把每个商品goods_id, 换成商品的图片和名字
  await Promise.all(arr.map(async goodsObj => {
    const [err2, [goodsInfoObj]] = await Db.query(`SELECT goods_list.goods_name, CONCAT('${staticPath}', goods_image.file_name) as file_name FROM goods_list JOIN goods_image ON goods_list.goods_id = goods_image.goods_id WHERE goods_list.goods_id = '${goodsObj['goods_id']}' GROUP BY goods_list.goods_id`);
    goodsObj['godsInfoObj'] = goodsInfoObj;
  }))
  res.send(Success(arr));
})

//=====================首页 排行榜
// 注意: 我们只查询前4个分类的id和名字, 每个分类去随便换取3件商品就可以了
router.get("/rankingList", async (req, res) => {
  const [err, arr] = await Db.query(`SELECT category_thired.thired_id, category_thired.thired_name, sum(goods_count) as sellCount FROM order_v JOIN goods_list ON goods_list.goods_id = order_v.goods_id JOIN category_thired ON goods_list.thired_id = category_thired.thired_id GROUP BY goods_list.goods_id ORDER BY sellCount DESC LIMIT 0, 4`); // 前4个分类的ID(按照销量排序)
  // 用每个三级分类的ID, 换取3件商品即可
  await Promise.all(arr.map(async thiredObj => {
    const [err, goodsArr] = await Db.query(`SELECT goods_list.goods_id, goods_list.goods_price,goods_list.goods_name,CONCAT('${staticPath}', goods_image.file_name) as file_name FROM goods_list JOIN goods_image ON goods_list.goods_id = goods_image.goods_id WHERE thired_id = '${thiredObj['thired_id']}' GROUP BY goods_list.goods_id LIMIT 0, 3`);
    thiredObj['goodsArr'] = goodsArr;
  }));
  res.send(Success(arr));
})

//=======================首页 下方8个板块
router.get("/homeList", async (req, res) => {
  const [err, arr] = await Db.query(`SELECT * FROM home JOIN category_second ON home.second_id = category_second.second_id`);
  await Promise.all(arr.map(async secondObj => {
    // 每个二级下的三级分类
    const [err2, thiredArr] = await Db.query(`SELECT thired_id, thired_name FROM category_thired WHERE second_id = '${secondObj['second_id']}'`);
    // 换区4件商品
    const [err3, goodsArr] = await Db.query(`SELECT goods_list.goods_name, goods_list.goods_manufacturer,CONCAT('${staticPath}', goods_image.file_name) as file_name FROM goods_list JOIN goods_image ON goods_list.goods_id = goods_image.goods_id WHERE second_id = '${secondObj['second_id']}' GROUP BY goods_list.goods_id LIMIT 0, 4`);
    secondObj['thiredArr'] = thiredArr;
    secondObj['goodsArr'] = goodsArr;
  }));
  res.send(Success(arr));
})

//=================首页  猜你喜欢接口
router.get('/guessLoveList',async (req,res)=>{
  if(req.cookies.userJwt === undefined){
    getRandGoodsList();
  } else {
    let uid = Auth.getUid(req.cookies.userJwt);//提取uid
    const [err, arr] = await Db.query(`SELECT * FROM guess_and_love WHERE uid = '${uid}'`);
    if(arr.length === 0) getRandGoodsList();// 如果是新号也调用随机返回
    else{
      // 随机从猜你喜欢中, 提取你的三级分类id, 然后查询20件商品返回给前端
      const [err2, [{thired_id}]] = await Db.query(`SELECT * FROM guess_and_love WHERE uid = '${uid}' ORDER BY RAND() LIMIt 0, 1`);
      const [err3, arr2] = await Db.query(`SELECT goods_list.goods_name,CONCAT('${staticPath}', goods_image.file_name) as file_name,goods_list.goods_price FROM goods_list JOIN goods_image ON goods_list.goods_id = goods_image.goods_id WHERE thired_id = '${thired_id}' GROUP BY goods_list.goods_id LIMIT 0, 20`);
      res.send(Success(arr2));
    }
  }
  async function getRandGoodsList(){
    // 默认未登录/没有喜欢的数据, 返回的随机20条数据
    const [err, [{randNum}]] = await Db.query(`SELECT round(((SELECT count(*) FROM goods_list) - 20)*rand(),0) as randNum`); // -20是为了随机时, 不要从最后的开始往后数, 可能不够20条, 所以下标的范围-20
    const [err2, arr] = await Db.query(`SELECT 
    goods_list.goods_id,
    goods_list.goods_name,
    CONCAT('${staticPath}', goods_image.file_name) as file_name,
    goods_list.goods_price
    FROM goods_list 
    JOIN goods_image ON goods_list.goods_id = goods_image.goods_id
    GROUP BY goods_list.goods_id
    LIMIT ${randNum}, 20`);
    // console.log(arr);
    res.send(Success(arr));
  }
})

//===============商品详情接口
router.get("/goodsDetail", async (req, res) => {
  let {query:{goodsid}} = url.parse(req.url, true);
  const [err, [goodsObj]] = await Db.query(`SELECT category_first.first_name,
  category_second.second_name,
  category_thired.thired_name,
  goods_list.goods_name,
  goods_list.goods_introduce,
  goods_list.goods_price,
  goods_list.assem_price,
  count(goods_eval.goods_id) as evalNum,
  goods_style.*,
  goods_list.goods_detailed_information
  FROM goods_list
  JOIN category_first ON goods_list.first_id = category_first.first_id
  JOIN category_second ON goods_list.second_id = category_second.second_id
  JOIN category_thired ON goods_list.thired_id = category_thired.thired_id 
  JOIN goods_eval ON goods_list.goods_id = goods_eval.goods_id
  JOIN goods_style ON goods_list.goods_id = goods_style.goods_id
  WHERE goods_list.goods_id = '${goodsid}'`);
  // 拼接5张图
  const [err2, imageArr] = await Db.query(`SELECT CONCAT('${staticPath}', file_name) as file_name FROM goods_image WHERE goods_id = '${goodsid}'`);
  goodsObj['imageArr'] = imageArr;
  // 评价列表数据
  const [err3, evalArr] = await Db.query(`SELECT goods_eval.*, member.username FROM 
  goods_eval
  JOIN member ON member.uid = goods_eval.uid
  WHERE goods_id = '${goodsid}'`);
  goodsObj['evalArr'] = evalArr;
  res.send(Success(goodsObj));
})

//====================橱窗接口
router.get("/winLocation", async (req, res) => {
  const [err, arr] = await Db.query(`SELECT goods_list.goods_name,
  goods_list.goods_price,
  CONCAT('${staticPath}', goods_image.file_name) as file_name
  FROM win_location
  JOIN goods_list ON win_location.goods_id = goods_list.goods_id
  JOIN goods_image ON goods_list.goods_id = goods_image.goods_id
  GROUP BY goods_list.goods_id`);
  res.send(Success(arr));
})

// ====================列表页接口
//一级分类
router.get('/categoryFirst', async (req, res, next)=>{
  const [errObj,dataArr] = await Db.query("SELECT * FROM category_first");//await 可以直接接受promise里的resolve的结果
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"一级分类查询成功"));
});
//二级分类
router.get('/categorySecond', async (req, res)=>{
  const {query:{first_id}} = url.parse(req.url,true);
  const [errObj,dataArr] = await Db.query(`SELECT * FROM category_second WHERE first_id = ${first_id}`);//await 可以直接接受promise里的resolve的结果
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"二级分类查询成功"));
});
//三级分类
router.get('/categoryThired', async (req, res)=>{
  const {query:{second_id}} = url.parse(req.url,true);
  const [errObj,dataArr] = await Db.query(`SELECT * FROM category_thired WHERE second_id = ${second_id}`);//await 可以直接接受promise里的resolve的结果
  if(errObj)res.send(MError("查询数据不存在"+errObj.toString()));
  else res.send(Success(dataArr,"三级分类查询成功"));
});
//数据铺设-->同搜索

module.exports = router;
