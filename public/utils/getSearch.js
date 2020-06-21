//获取地址栏?后面的参数 getSearch('goodId')
function getSearch(seNameStr) {
	// 获取?后面的请求
	let str = (window.location.search).substr(1);
	let strArr = str.split("&");
	for (let i = 0; i < strArr.length; i++) {
		let spArr = strArr[i].split("=");
		if (spArr[0] === seNameStr) {
			// console.log(spArr[1],decodeURIComponent(spArr[1]));
			return decodeURIComponent(spArr[1]);
		}
	}
	return '';
}

//获取指定cookie值 getCookie('userName')
function getCookie(nameStr){
    var arr = document.cookie.split("; ");//注意是分号空格
    for(var i = 0;i<arr.length;i++){
        var arrName = arr[i].split("=");
       if(arrName[0] == nameStr){
            return arrName[1];
        }
    }
    return '';
}
