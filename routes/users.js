var express = require('express');
var router = express.Router();
const Db = require("../utils/Db");
const svgCaptcha = require("svg-captcha"); //验证码模块
const uuid = require("uuid").v1; //uuid模块
const Auth = require("../utils/auth");//生成/提取uid
const shopcarModel = require("../model/shopcarModel");//数据模型 操作购物车表
const {Success,MError,Guest} = require("../utils/Result");// 引入统一返回的接口对象的生成方法
Db.connect();
//==================base64
const base64 = (str) => { //base64加密方法
  if (typeof str !== 'string') {
      str = JSON.stringify(str);
  }
  return Buffer.from(str).toString("base64");
}
const base64decode = (str = "") => { // base64解密
  return Buffer.from(str, "base64").toString('utf-8');
}


//============图形验证码接口
router.get("/getCode",(req,res)=>{
  const captcha = svgCaptcha.create();
  res.setHeader('Cache-Control','no-store');//禁止缓存
  res.cookie("code",captcha.text,{maxAge:1000*60});// 把真正的验证码保存到cookie上
  res.type("svg");
  res.send(captcha.data);
})
//============用户注册接口
router.post("/register",async (req,res)=>{
  //先查询 用户是否存在
  const [errObj,dataArr] = await Db.query(`SELECT * FROM member WHERE username = '${req.body.username}'`); 
  //存在 阻止注册
  if(dataArr.length > 0){
    res.send(MError("当前用户已存在"));
    return;
  }
  //注册
  // console.log(req.body)
  if(req.cookies.code.toUpperCase() == req.body.userCode.toUpperCase()){
    const [errObj,dataArr] = await Db.query(`INSERT INTO member(uid,username,password,createdate) VALUES('${uuid()}','${req.body.username}','${req.body.password}',${new Date().getTime()})`);
    res.send(Success([],'注册成功！')); 
  }else{
    res.send(MError("验证码错误！")); 
  }
})

//============用户登录接口
router.post("/login",async (req,res)=>{
  if(req.cookies.code.toUpperCase() == req.body.userCode.toUpperCase()){
    const [errObj,dataArr] = await Db.query(`SELECT uid,username,password FROM member WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
    if(dataArr.length > 0){
      // 生成jwt字符串, 用于替代密码, 在前端使用, 标识用户的身份, 方便一些需要识别用户的接口来使用
      // jwt 三部分组成
      // (1):header (说明jwt生成的一些方式, 比如使用base64加密)  (2): payload(内容)  (3): sign(用于核对, jwt是否被人串改)
      // console.log(dataArr,dataArr[0]['uid'])
      let jwtHeader = {// 告诉别人我这个jwt字符串生成时, 类型是token(作用), 生成的方式使用的是base64加密方式
        type:"tocen",
        sec:"base64"
      }
      let jwtPayload = {
        uid:dataArr[0]['uid'],//得到用户的uid身份标识
        createTime: new Date().getTime(),//生成时时间 毫秒
        expire: 10 * 60 * 60 * 1000 //有效期 10分钟
      }
      let sign = base64(JSON.stringify(jwtHeader) + JSON.stringify(jwtPayload));// 用base64加密上2个对象生成一个base64字符串(为了在解密使用时, 对前边2个东西, 进行匹配判断, 查看前2个参数的值有没有被人串改)
      let jwtStr = base64(JSON.stringify(jwtHeader) + "." + JSON.stringify(jwtPayload) + "." + sign); // .可以随便用, 目的为了以后解密时, 方便分割
      res.cookie("userJwt",jwtStr);
      res.cookie("userName",req.body.username);
      res.send(Success([],"登录成功"));
    }else{
      res.send(MError("账号或密码错误!"));
    }
  }else{
    res.send(MError("验证码错误！"));
  }
})

//===========购物车接口
router.get("/shopCarList", async (req,res)=>{
  if(req.cookies.userJwt === undefined){
    res.send(Guest('请先登录，再查看购物车信息'));
  }else{
    let result = Auth.getUid(req.cookies.userJwt);//提取uid
    if(result === false){
      res.send(Guest('用户身份过期，请从新登录'));
    }else{
      // 如果正确的话result的值是提取出来的uid, 执行传到MVC里的Model层模块获取数据返回给arr变量
      const arr = await shopcarModel.selectListByUid(result);
      res.send(Success(arr, '购物车信息获取成功'));
    }
  }

  // // 需要从jwt里, 提取到你的uid, 才能知道你是谁, 先解密
  // let base64decodeStr = base64decode(req.cookies.userJwt);
  // let baseArr = base64decodeStr.split(".");// 分割成3个元素, 就是jwt的三个组成部分
  // // arr[0] 对应jwtHeader, arr[1] 对应jwtPayload arr[2] 对应sign的值
  // if(base64(baseArr[0] + baseArr[1]) === baseArr[2]){// 对前2个加密和第三个sign来比较, 如果想当, 证明没人串改
  //   let obj = JSON.parse(baseArr[1]);//转换成对象
  //   // console.log(obj.uid);
  //   //判断是否过期？
  //   let newTime = new Date().getTime();// 每次调用new Date()获取的是当前服务器上的时间
  //   if(newTime - obj.createTime > obj.expire){
  //     res.send(Guest("jwt已经过期了, 请重新登录"));
  //   }else{
  //     //没有过期，返回他的购物车信息
  //     const arr = await shopcarModel.selectListByUid(obj['uid']);
  //     res.send(Success(arr,"购物车信息获取成功"));
  //   }
  // }else{
  //   res.send(MError("用户身份，已被非法修改！！"));
  // }
})


module.exports = router;
