$(function(){
    //验证码刷新
    $("#code").on('click',()=>{
        $("#code").attr("src","/users/getCode");
    })

    //登录
    $("#sub").on('click',()=>{
        let mail = $("#userMail").val();
        let pwd = hex_md5($("#userPwd").val());
        let yzm = $("#yzm").val();
        register(mail,pwd,yzm);
        return false;
    })
    async function register(mail,pwd,yzm){

		const res = await myAjax({
            url:'/users/login',
            data:{
                username:mail,
                password:pwd,
                userCode:yzm
            },
            type:'post'
        });
        if(res instanceof Array){
            window.location = './index.html'
        }
    }


})