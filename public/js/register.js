$(function(){
    //验证码刷新
    $("#code").on('click',()=>{
        $("#code").attr("src","/users/getCode");
    })

    //注册
    $("#sub").on('click',()=>{
        let mail = $("#userMail").val();
        let pwd = hex_md5($("#userPwd").val());
        let yzm = $("#yzm").val();
        // console.log(mail,pwd,yzm);
        register(mail,pwd,yzm);
        return false;
    })
    async function register(mail,pwd,yzm){
		const res = await myAjax({
            url:'/users/register',
            data:{
                username:mail,
                password:pwd,
                userCode:yzm
            },
            type:'post'
        });
        if(res instanceof Array){
            alert("注册成功！")
            window.location = './login.html'
        }
    }
})