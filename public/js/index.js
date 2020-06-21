$(function() {
	//登录用户显示
	
	console.log(getCookie('userName'));
	if(getCookie('userName')){
		console.log('1');
		$("#login").html(`用户：<a href="./cat.html" style="color: orange;">${getCookie('userName')}</a>`);
		$("#register").css('display','none');
	}else{
		console.log('0')
	}


	//1.1 录入关键词
	$("#sech").on('click',()=>{
		let search = $("#search").val();
		if(!search.trim())return;
		getSearch(search);
		return false;
	})

	$("#SeachList").on('click','a',(ev)=>{
		let search = $(ev.target).text();
		getSearch(search);
	})


	async function getSearch(search){
		const res = await myAjax({url:'/api/enterSearch',data:{searchText:search},type:'post'});
		if(res.length === 0){
			// alert("搜索成功！");
			window.location = `./list.html?searchText=${search}`;
		}else{
		}
	}

	async function getLoveList(){
		const res = await myAjax({url:'/api/guessLoveList'});
		console.log(res);
		let liS = res.reduce((str,obj)=>{
			let {goodsId,goodsName,fileName,goodsPrice} = obj;
			return str + `<li>
							<a href="./details.html?goodsId=${goodsId}">
								<img src="${fileName}" >
							<div class="txt">
								<p class="txt1">${goodsName}</p>
								<span>￥${goodsPrice}</span>
								<i>找相似</i>
								<p class="txt2"><i class="djh">大钜惠</i><i class="lj">领卷78-5</i></p>
							</div>
							</a>
						</li>`;
		},'');
		$("#guessLove").html(liS);
	}
	getLoveList();


	async function getData(){
		//1 热搜渲染页面 SeachList
		const res1 = await myAjax({url:'/api/hotSearchList'});
		// console.log(res1);
		;(function(res){
			// 测试返回数据
			// console.log(res.list[1].searchText);
			$.each(res, function(idx, item) {
				// console.log(idx,item.searchText);
				$('#SeachList').append($(`<a href="javascript:;">${item['searchText']}</a>`));
			});
		})(res1);

		// 2banner图渲染页面
		const res2 = await myAjax({url:'/api/bannerList'});
		// console.log(res2);
		;(function(res){
			// console.log(res.list.length);
			$.each(res, function(idx, item) {
				// console.log(idx,item.coverimg);
				$('#banUl').append($(
					`<li><a href="javascript:;"><img src="${item['coverimg']}" ></a></li>`));
				$('.foucs-list').append($('<span></span>'));
				//绑定属性 下标 将数据暂存在jQuery对象上	attr显示 字符型   data隐示
				// $('.foucs-list>span:nth-child(' + (idx + 1) + ')').attr('ids', idx);
				$('.foucs-list>span:nth-child(' + (idx + 1) + ')').data('ids', idx);
			});
			// console.log($('.foucs-list>span:nth-child(7)').attr('ids'))
			// console.log($('.foucs-list>span:nth-child(7)').data('ids'));
			//初始样式
			function size() {
				$('.foucs-list>span:first-child').addClass('active');
				$('#banUl').width(res.length * $(window).width());
				$('#banUl>li').width($(window).width());
			}
			size();
			$(window).resize(function() {
				size();
			});
			//轮播
			let n = 0;
			
			function auto() {
				if (n >= res.length) {
					$('#banUl').animate({
						left: 0
					}, 0);
					n = 0;
				}
				n++;
				let end = -n * $('#banUl>li').width();
				$('#banUl').animate({
					left: end
				}, 2000);
				// console.log(n)
				if (n >= res.length) {
					$('.foucs-list>span:nth-child(1)').addClass('active').siblings().removeClass('active');
				} else {
					$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
				}
			}
			//无缝
			let $fade = $('#banUl>li:first-child').clone(true);
			$('#banUl').append($fade);
			$('#banUl').width($('#banUl>li').length * $('#banUl>li').width());
			//序号切换
			$('.foucs-list>span').on('mouseover', function(ev) {
				//获取当前的下标 自定义属性
				// n = parseInt($(ev.target).attr('ids'));
				n = $(ev.target).data('ids');
				// console.log(n+1,typeof n)
				let end = -n * $('#banUl>li').width();
				$('#banUl').animate({
					left: end
				}, 2000);
				$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
			});
			//箭头轮播
			$('.banner').on('click', '.btn', function() {
				if ($(this).hasClass('btn-left')) {
					if (n <= 0) {
						let end = -res.length * $('#banUl>li').width();
						$('#banUl').animate({
							left: end
						}, 0);
						n = res.length;
					}
					n--;
					let end = -n * $('#banUl>li').width();
					$('#banUl').animate({
						left: end
					}, 2000);
					$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
				} else if ($(this).hasClass('btn-right')) {
					auto();
				}
			});
			
			//开始动画
			let timer = setInterval(auto, 3000);
			//鼠标移入移出
			$('.banner').hover(function() {
				clearInterval(timer);
			}, function() {
				timer = setInterval(auto, 3000);
			})
		})(res2);
		// 3 menu>ulSort
		const res3 = await myAjax({url:'/api/firstCategory'});
		console.log(res3);
		;(function(res){
			// console.log(res.list);
			let nf = Math.ceil(res.length/3),n=0,obj=[];
			for(let i=0; i<nf; i++){
				obj.push(res.slice(n,(3+n)));
				n = n+3;
			}
			let liS = obj.reduce((str,obj)=>{
				let aS = obj.reduce((stra,obja)=>{
					let {firstName,firstId} = obja;
					return stra+= `<a href="javascript:;" firstId='${firstId}'>${firstName}</a>`;
				},'');
				return str += `<li>${aS}</li>`;
			},'');
			// console.log(liS);
			$('#ulSort').html(liS);

			// $.each(obj, function(idx, item) {
			// 	// console.log(idx,item)
			// 	$li = $('<li>');
			// 	$.each(item, function(idx, item) {
			// 		$li.append($(`<a href="javascript:;">${item.firstName}</a>`));
			// 	})
			// 	$('#ulSort').html($li);
			// });
		})(res3);
		//4人气好货
		const res4 = await myAjax({url:'/api/homeGoodEvalList'});
		// console.log(res4);
		;(function(res){
			console.log(res)
			let liS = res.reduce(function(str, obj) {
				let {godsInfoObj:{fileName,goodsName},goodEvalCount,goodsId} = obj;
				// console.log(fileName,goodsName)
				return str +=
					`<li goodsId="${goodsId}">
									<a href="javascript:;">
										<img src="${fileName}">
										<p>${goodsName}</p>
										<i>👍${goodEvalCount}人都说好</i>
									</a>
									</li>`;
			}, '');
			$('#goodsUl').append(liS);
		})(res4);
		//5排行榜 /api/rankingList
		const res5 = await myAjax({url:'/api/rankingList'});
		// console.log(res5);
		;(function(res){
			let liS = res.reduce(function(str, obj) {
				// console.log(obj)
				// let {
				// 	thiredId,
				// 	thiredName,
				// 	goodsList
				// } = obj;
				let {goodsArr,thiredId,thiredName} = obj;
				// console.log(thiredId,thiredName,goodsList)
				let div = goodsArr.reduce(function(str, obj) {
					// console.log(obj)
					let {
						goodsName,
						goodsPrice,
						fileName,
						goodsId
					} = obj;
					return str +=
						`<li goodsId="${goodsId}">
											<a href="javascript:;">
												<img src="${fileName}">
												<div>
													<h3>${goodsName}</h3>
													<span>￥${goodsPrice}</span>
													<i>销量NO1</i>
												</div>
											</a>
										</li>`;
				}, '');
				$('#ulLis').append(`<ul>${div}</ul>`);
				return str += `<li thiredId='${thiredId}'><a href="javascript:;">${thiredName}</a></li>`;
			}, '');
			$('#navList').append(liS);
			$('#ulLis>ul:nth-child(1)').addClass('active').siblings().removeClass('active');
			$('#navList>li:nth-child(1)').addClass('active').siblings().removeClass('active');
			//绑定下标
			$('#navList li').each(function(idx, item) {
				// console.log(idx,item);
				$(item).data('idx', idx + 1);
			})
			//选项卡功能
			$('#navList>li').on('mouseover', function() {
				$(this).addClass('active').siblings().removeClass('active');
				let n = $(this).data('idx');
				$('#ulLis>ul:nth-child(' + n + ')').addClass('active').siblings().removeClass('active');
			})
		})(res5);
		//6homeList -->8 http://106.13.114.114:5000/api/homeList
		const res6 = await myAjax({url:'/api/homeList'});
		console.log(res6);
		// console.log(res6.list.length = 4,res6.list);
		;(function(res){
			console.log(res);
			let fs = res.reduce((str,obj)=>{
				// console.log(obj);
				let {secondId,secondName,thiredArr,goodsArr} = obj;
				// console.log(secondId,secondName,thiredList,goodsList);
				
				let thiredliS = thiredArr.reduce((str,obj)=>{
					let {thiredId,thiredName} = obj;
					return str += `<li thiredId='${thiredId}'><a href="JavaScript:;">${thiredName}</a></li>`;
				},'');
				let goodsliS = goodsArr.reduce((str,obj)=>{
					let {fileName,goodsName,goodsManufacturer} = obj;
					// console.log(fileName,goodsName)
					return str += `<li>
										<a href="javascript:;">
											<i>${goodsName}</i>
											<p>${goodsManufacturer}</p>
											<img src="${fileName}" >
										</a>
									</li>`;
				},'');
				
				return str +=`<div class="ul-list" secondId='${secondId}'>
							<div class="u-top clearfix" id="top1">
								<div class="bt fl">
									<i></i>
									<h3>${secondName}</h3>
									<img src="./images/fs-e01.png" >
								</div>
									<ul class="nav-u fr">
										${thiredliS}
									</ul>
							</div>
							<div class="u-bott clearfix">
								<div class="img-lf fl">
									<img src="images/fs-01.png" >
								</div>
								<ul class="u-img fl" id="one1">
									${goodsliS}
								</ul>
							</div>
						</div>`;
			},'');
			$('#fsLs').append(fs);
		})(res6);
	}
	getData();
	
	
	
	//1 热搜渲染页面 SeachList
	// $.get('http://106.13.114.114:5000/api/getSeachList', function(res) {
	// 	// 测试返回数据
	// 	// console.log(res.list[1].searchText);
	// 	$.each(res.list, function(idx, item) {
	// 		// console.log(idx,item.searchText);
	// 		$('#SeachList').append($(`<a href="javascript:;">${item['searchText']}</a>`));
	// 	});
	// });

	//2banner图渲染页面
	// $.get('http://106.13.114.114:5000/api/bannerList', function(res) {
	// 	// console.log(res.list.length);
	// 	$.each(res.list, function(idx, item) {
	// 		// console.log(idx,item.coverimg);
	// 		$('#banUl').append($(
	// 			`<li><a href="javascript:;"><img src="http://106.13.114.114:5000/${item['coverimg']}" ></a></li>`));
	// 		$('.foucs-list').append($('<span></span>'));
	// 		//绑定属性 下标 将数据暂存在jQuery对象上	attr显示 字符型   data隐示
	// 		// $('.foucs-list>span:nth-child(' + (idx + 1) + ')').attr('ids', idx);
	// 		$('.foucs-list>span:nth-child(' + (idx + 1) + ')').data('ids', idx);
	// 	});
	// 	// console.log($('.foucs-list>span:nth-child(7)').attr('ids'))
	// 	// console.log($('.foucs-list>span:nth-child(7)').data('ids'));
	// 	//初始样式
	// 	function size() {
	// 		$('.foucs-list>span:first-child').addClass('active');
	// 		$('#banUl').width(res.list.length * $(window).width());
	// 		$('#banUl>li').width($(window).width());
	// 	}
	// 	size();
	// 	$(window).resize(function() {
	// 		size();
	// 	});
	// 	//轮播
	// 	let n = 0;

	// 	function auto() {
	// 		if (n >= res.list.length) {
	// 			$('#banUl').animate({
	// 				left: 0
	// 			}, 0);
	// 			n = 0;
	// 		}
	// 		n++;
	// 		let end = -n * $('#banUl>li').width();
	// 		$('#banUl').animate({
	// 			left: end
	// 		}, 2000);
	// 		// console.log(n)
	// 		if (n >= res.list.length) {
	// 			$('.foucs-list>span:nth-child(1)').addClass('active').siblings().removeClass('active');
	// 		} else {
	// 			$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
	// 		}
	// 	}
	// 	//无缝
	// 	let $fade = $('#banUl>li:first-child').clone(true);
	// 	$('#banUl').append($fade);
	// 	$('#banUl').width($('#banUl>li').length * $('#banUl>li').width());
	// 	//序号切换
	// 	$('.foucs-list>span').on('mouseover', function(ev) {
	// 		//获取当前的下标 自定义属性
	// 		// n = parseInt($(ev.target).attr('ids'));
	// 		n = $(ev.target).data('ids');
	// 		// console.log(n+1,typeof n)
	// 		let end = -n * $('#banUl>li').width();
	// 		$('#banUl').animate({
	// 			left: end
	// 		}, 2000);
	// 		$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
	// 	});
	// 	//箭头轮播
	// 	$('.banner').on('click', '.btn', function() {
	// 		if ($(this).hasClass('btn-left')) {
	// 			if (n <= 0) {
	// 				let end = -res.list.length * $('#banUl>li').width();
	// 				$('#banUl').animate({
	// 					left: end
	// 				}, 0);
	// 				n = res.list.length;
	// 			}
	// 			n--;
	// 			let end = -n * $('#banUl>li').width();
	// 			$('#banUl').animate({
	// 				left: end
	// 			}, 2000);
	// 			$('.foucs-list>span:nth-child(' + (n + 1) + ')').addClass('active').siblings().removeClass('active');
	// 		} else if ($(this).hasClass('btn-right')) {
	// 			auto();
	// 		}
	// 	});



	// 	//开始动画
	// 	let timer = setInterval(auto, 3000);
	// 	//鼠标移入移出
	// 	$('.banner').hover(function() {
	// 		clearInterval(timer);
	// 	}, function() {
	// 		timer = setInterval(auto, 3000);
	// 	})
	// });

	// 3 menu>ulSort
	// $.get('http://106.13.114.114:5000/api/firstCategory', function(res) {
	// 	// console.log(res.list);
	// 	$.each(res.list, function(idx, item) {
	// 		// console.log(idx,item)
	// 		$li = $('<li>');
	// 		$.each(item, function(idx, item) {
	// 			$li.append($(`<a href="javascript:;">${item.firstName}</a>`));
	// 		})
	// 		$('#ulSort').append($li);
	// 	})
	// });

	// 4 人气好货重构
	// $.get('http://106.13.114.114:5000/api/getEvalGoodList', function(res) {
	// 	// console.log(res['list'])
	// 	let liS = res['list'].reduce(function(str, obj) {
	// 		let {
	// 			evalNum,
	// 			goodsId,
	// 			fileName,
	// 			goodsName
	// 		} = obj;
	// 		// console.log(fileName,goodsName)
	// 		return str +=
	// 			`<li goodsId="${goodsId}">
	// 							<a href="javascript:;">
	// 								<img src="http://106.13.114.114:5000/${fileName}">
	// 								<p>${goodsName}</p>
	// 								<i>👍${evalNum}人都说好</i>
	// 							</a>
	// 							</li>`;
	// 	}, '');
	// 	$('#goodsUl').append(liS);
	// });

	// 5 排行榜
	// $.get('http://106.13.114.114:5000/api/getSellHotList', function(res) {
	// 	// console.log(res);
	// 	let liS = res['list'].reduce(function(str, obj) {
	// 		// console.log(obj)
	// 		let {
	// 			thiredId,
	// 			thiredName,
	// 			goodsList
	// 		} = obj;
	// 		// console.log(thiredId,thiredName,goodsList)
	// 		let div = goodsList.reduce(function(str, obj) {
	// 			// console.log(obj)
	// 			let {
	// 				goodsName,
	// 				goodsPrice,
	// 				fileName
	// 			} = obj;
	// 			return str +=
	// 				`<li>
	// 									<a href="javascript:;">
	// 										<img src="${fileName}">
	// 										<div>
	// 											<h3>${goodsName}</h3>
	// 											<span>￥${goodsPrice}</span>
	// 											<i>销量NO1</i>
	// 										</div>
	// 									</a>
	// 								</li>`;
	// 		}, '');
	// 		$('#ulLis').append(`<ul>${div}</ul>`);
	// 		return str += `<li thiredId='${thiredId}'><a href="javascript:;">${thiredName}</a></li>`;
	// 	}, '');
	// 	$('#navList').append(liS);
	// 	$('#ulLis>ul:nth-child(1)').addClass('active').siblings().removeClass('active');
	// 	$('#navList>li:nth-child(1)').addClass('active').siblings().removeClass('active');
	// 	//绑定下标
	// 	$('#navList li').each(function(idx, item) {
	// 		// console.log(idx,item);
	// 		$(item).data('idx', idx + 1);
	// 	})
	// 	//选项卡功能
	// 	$('#navList>li').on('mouseover', function() {
	// 		$(this).addClass('active').siblings().removeClass('active');
	// 		let n = $(this).data('idx');
	// 		$('#ulLis>ul:nth-child(' + n + ')').addClass('active').siblings().removeClass('active');
	// 	})

	// });

	
	//侧边固定
	$(window).on('scroll', function() {
		let sT = $(document).scrollTop();
		// console.log(sT)
		if (sT >= 500) {
			$('.lef-navbar').css('display', 'block');
		} else {
			$('.lef-navbar').css('display', 'none');
		}
	});
	let t = null;
	$('.db').click(function() {
		clearInterval(t);
		t = setInterval(function() {
			if ($(document).scrollTop() <= 0) {
				clearInterval(t);
			} else {
				let k = $(document).scrollTop();
				$(document).scrollTop(k -= 100);
			}
		}, 30);
	});
});
