$(function(){
	//页码
	let page = 1;
	//每页显示条数
	let everyNum = 20;
	//一级菜单
	async function getFirst(){
		const res = await myAjax({url:'/api/categoryFirst'});
		// console.log(res);
		// let aS = res.reduce((str,arr,idx)=>{
		// 	console.log(arr,idx);
		// 	return str+=arr.reduce((ele,obj,idx)=>{
		// 		// console.log(obj);
		// 		let {firstId,firstName} = obj;
		// 		 // class="${idx ===0 ? 'active':''}"  onclick = "firstClickFn(event)"
		// 		return ele+=`<a href="javascript:;" firstId='${firstId}'>${firstName}</a>`;
		// 	},'');
		// },'');
		let aS = res.reduce((str,arr,idx)=>{
			// console.log(arr,idx);
			let {firstId,firstName} = arr;
			return str+=`<a href="javascript:;" firstId='${firstId}'>${firstName}</a>`;
		},'');
		//添加 初始化样式 调用二级菜单
		$("#first").append(aS);
		$("#first>a:first").addClass('active');
		getSecond($("#first>a:first").attr('firstId'));
	}
	getFirst();
	
	//点击
	$('#first').on('click','a',function(ev){
		$(ev.target).addClass('active').siblings().removeClass('active');
		//调用二级菜单
		page = 1;
		// console.log($(ev.target).attr('firstId'))
		getSecond($(ev.target).attr('firstId'));
	});
	
	//二级菜单
	async function getSecond(first_id){
		const res = await myAjax({url:'/api/categorySecond',data:{first_id}});
		// console.log(res);
		let aS = res.reduce((ele,obj,idx)=>{
			// console.log(obj)
			let {secondId,secondName} = obj;
			return ele += `<a href="javascript:;" secondId='${secondId}' class="${idx ===0 ? 'active':''}">${secondName}</a>`;
		},'');
		$('#Second').html(aS);
		getThird($('#Second>a:first').attr('secondId'));
	}
	
	//点击
	$('#Second').on('click','a',function(ev){
		$(ev.target).addClass('active').siblings().removeClass('active');
		//调用三级菜单
		page = 1;
		getThird($(ev.target).attr('secondId'));
	});
	
	//三级菜单
	async function getThird(second_id){
		const res = await myAjax({url:'/api/categoryThired',data:{second_id}});
		// console.log(res);
		let aS = res.reduce((ele,obj,idx)=>{
			let {thiredId,thiredName} = obj;
			return ele += `<a href="javascript:;" thiredId='${thiredId}' class="${idx ===0 ? 'active':''}">${thiredName}</a>`;
		},'');
		$('#Third').html(aS);
		$('#Third>a:first').attr('secondId')
		getcentList($($('.active')[2]).attr('thiredId'));
	}
	
	//点击
	$('#Third').on('click','a',function(ev){
		$(ev.target).addClass('active').siblings().removeClass('active');
		page = 1;
		getcentList();
	});
	
	//铺设下方数据
	async function getcentList(){
		//监测 screen下的 a 有没有被点击
		$("#screen").on('click','a',()=>{
			window.onoff = 1;
		})

		if(window.onoff){
			var searchText = undefined;
		}else{
			//searchText 搜索关键词
			var searchText = getSearch('searchText');
		}

		// 获取商品对象的id 只需要传三级分类id
		const thired_id = $($('.active')[2]).attr('thiredId');
		//获取排序依据
		const how = $($('.active')[3]).attr('screen');
		// console.log(first_id,second_id,thired_id,order);

		console.log(searchText,thired_id)
		
		const res = await myAjax({url:'/api/searchGoodsList',data:{searchText,thired_id,how,page,everyNum}});
		//信息条数
		const allCount = res['allCount'];
		console.log(res);
		console.log(res['data'],allCount);
		let liS = res['data'].reduce((ele,obj,idx)=>{
			// console.log(obj);
			let {evalCount,imageUrl,goodsId,goodsName,goodsPrice} = obj;
			return ele += `<li goodsId="${goodsId}">
							<a href="./details.html?goodsId=${goodsId}&dyh=100#11">
								<img src="${imageUrl}" >
								<div class="txts">
									<strong>￥${goodsPrice}</strong>
									<p>${goodsName}</p>
									<p class="txt1">不要错过,不要辜负</p>
									<p class="txt2">已有<i>${evalCount}万+</i>人评价</p>
									<ol class="cart clearfix">
										<li>
											<span class="iconfont">&#xe603;</span>
											加入购物车
										</li>
										<li>
											<span class="iconfont">&#xe608;</span>
											收藏
										</li>
									</ol>
									
								</div>
							</a>
						</li>`;
		},'');
		$('#centList').html(liS);
		$('#allNum').html(`共${allCount}件商品`);
		//总页数
		let pageSum = Math.ceil(allCount/everyNum);
		$('#page').html(`<b>${page}</b>/${pageSum}`).attr('pageSum',`${pageSum}`);
	}
	//排序
	$('#screenUl').on('click','li',(ev)=>{
		$(ev.target).addClass('active').siblings().removeClass('active');
		getcentList();
	});
	
	// 翻页模块
	$('.pageDown').on('click',()=>{
		let pageSum = $('#page').attr('pageSum');
		if(page <= 1)return false;
		page--;
		$('#page').html(`<b>${page}</b>/${pageSum}`);
		getcentList();
	});
	$('.pageUp').on('click',()=>{
		let pageSum = $('#page').attr('pageSum');
		if(page >= pageSum)return false;
		page++;
		$('#page').html(`<b>${page}</b>/${pageSum}`);
		getcentList();
	});
	
	
	//商品推荐
	async function getProduct(){
		const res = await myAjax({url:'/api/winLocation'});
		// console.log(res);
		let liS = res.reduce((ele,obj,idx)=>{
			let {fileName,goodsId,goodsName,goodsPrice} = obj;
			return ele += `<li goodsId='${goodsId}'>
						<a href="./details.html?goodsId=${goodsId}">
							<img src="${fileName}" >
							<div class="txt">
								<p>${goodsName}</p>
								<p>LED55EC760UC 55英寸曲面</p>
								<span>￥${goodsPrice}</span>
							</div>
						</a>
					</li>`;
		},'');
		$('#ProductList').html(liS);
	}
	getProduct();
})