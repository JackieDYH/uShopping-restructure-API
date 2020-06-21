$(function(){
	async function getDetails(){
		 const res = await myAjax({url:'http://106.13.114.114:5000/api/goodsDetail',data:{goods_id:getSearch('goodsId')}});
		 console.log(getSearch('goodsId'));
	}
	getDetails();
})