$(function(){
    async function getCartList(){
        const res = await myAjax({url:'/users/shopCarList'});
        console.log(res);
        let dlS = res.reduce((ele,obj)=>{
            return ele +=`<dd>
            <ul class="clearfix">
                <li><label><input type="checkbox" name="" value="" /><i>全选</i></label></li>
                <li>
                    <a href="javascript:;" class="clearfix">
                        <img class="fl" src="${obj['goodsObj']['fileName']}">
                        <div class="txt fl">
                            <h3>${obj['goodsObj']['goodsName']}</h3>
                            <span>${obj['goodsObj']['styleName']}:</span>
                            <span>${obj['goodsObj']['styleValue']}</span>
                        </div>
                    </a>
                </li>
                <li goodsPrice='${obj['goodsObj']['goodsPrice']}'>￥${obj['goodsObj']['goodsPrice']}.00</li>
                <li>
                    <ol class="clearfix">
                        <li>-</li>
                        <li>${obj['goodsNum']}</li>
                        <li>+</li>
                    </ol>
                </li>
                <li>￥${obj['goodsObj']['goodsPrice'] * obj['goodsNum']}</li>
                <li>
                    <a href="javascript:;">删除</a>
                    <p><a href="javascript:;">移入收藏夹</a></p>
                </li>
            </ul>
        </dd>`;
        },'');
        // console.log(dlS);
        $("#bef").before(dlS);
    }
    getCartList();


})