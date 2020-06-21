;(function(){
	function myAjax({url='', data={}, type='get'}) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url,
				type,
				data,
				dataType: "json",
				success(res){
					if(res.code === 200){
						resolve(res['list']);// 统一取值
					}else{
						alert('ERR:'+res.msg); // 报错了提示下
					}
				},
				error: err => reject(err)
			});
		});
	}
	window.myAjax = myAjax;
})();