// 定义统一的返回接口的数据对象格式, 方便前端统一处理判断
/**
 * 完全成功
 * list 数据
 * msg 提示文字
 * code: 自定义一个前端判断状态的数字
 */
// exports.a = 1 和module.exports = {a: 1}相等
exports.Success = (list = [], msg = '恭喜你, 操作成功') => {
     // 转成驼峰标识
    jsonToHump(list) // 注意: 对象是引用关系, 所以传参是浅复制, 下面返回的还是同一个处理后的引用的数组/对象
    return {
        msg,
        code: 200,
        list 
    }
}
// 参数正确， 但是权限不够
exports.Guest = (msg = '权限非法') => {
    return {
        msg,
        code: 403
    }
}
// 参数错误，请检查传递的参数
exports.MError = (msg = '参数等发生错误') => {
    return {
        msg,
        code: 500
    }
}


// xxx_axx  转 xxxAxx 下划线_转驼峰方法
// 注意嵌套问题 (所以需要递归)
function underline2Hump(s) {
    return s.replace(/_(\w)/g, function (all, letter) {
        return letter.toUpperCase()
    })
}
const jsonToHump = (obj) => {
    if (obj instanceof Array) { // instanceof 判断左侧对象是否是右侧类的实例出来的对象 跟typeof 类似
        obj.forEach(function (v, i) {
            jsonToHump(v) // 处理数组里每一项
        })
    } else if (obj instanceof Object) {
        Object.keys(obj).forEach(function (key) { //  Object.keys(obj) 取出所有此对象所有的key返回一个数组
            var newKey = underline2Hump(key) // 把下划线的key转成驼峰连接
            if (newKey !== key) { // 证明一个是驼峰一个还是下划线, 所以进入, 删除下划线的key, 添加驼峰的key然后赋值.
                obj[newKey] = obj[key]
                delete obj[key]
            }
            jsonToHump(obj[newKey]) // 如果对象key对应的value还是一个对象, 那么所有需要调用在判断
        })
    } // 因为如果value既不是对象也不是数组, 没有必要再进入递归了
}