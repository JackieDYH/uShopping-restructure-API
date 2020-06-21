//权限类- 生成 / 提取  uid值
const base64decode = (str = "") => { // base64解密
    return Buffer.from(str, "base64").toString('utf-8');
}  
const base64 = (str) => { //base64加密方法
    if (typeof str !== 'string') {
        str = JSON.stringify(str);
    }
    return Buffer.from(str).toString("base64");
}
class Auth{
    static getUid(jwtStr){
        let base64decodeStr = base64decode(jwtStr);
        let arr = base64decodeStr.split('.');
        // arr[0] 对应jwtHeader, arr[1] 对应jwtPayload arr[2] 对应sign的值
        if (base64(arr[0] + arr[1]) === arr[2]){ // 对前2个加密和第三个sign来比较, 如果想当, 证明没人串改
            let obj = JSON.parse(arr[1]); // 把字符串转换回对象
            // 判断是否过期?
            let nowTime = new Date().getTime(); // 每次调用new Date()获取的是当前服务器上的时间
            if (nowTime - obj.createTime > obj.expire) {
                return false;
            } else {
                return obj['uid'];
            }
        } else {
            return false;
        }
    }
}
module.exports = Auth;