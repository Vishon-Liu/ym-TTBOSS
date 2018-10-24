//app.js
App({
  //配置
  d: {
    hostUrl: 'https://push.ymindex.com/bossapi/', //请求的主域名
    serverName:'https://image.ymindex.com',//域名
  },
  globalData: {
    userInfo: false,//用户的基本信息
    sessionid:'',//通信ID
    companyInfo:false,//公司信息
    token:'',//受邀凭证
    moveToke: '',//用户转移凭证
    //登录用户的基本信息
    loginInfo:{
      sessionid
        :
        "1F5f4QWNPj0-hHg0Es2Gg6Axi4plO9LrEpfWSK1p751u9KijouNCOzl5pCrwCAU3"
    },
  },  
  onLaunch: function (options) { 
    console.log(options)
    //保存扫二维码进入场景的token
    if (options.scene == 1011 && options.query.token){
      this.globalData.token = options.query.token;
    }
    //保存扫二维码进入场景的用户转移token
    if (options.scene == 1011 && options.query.move) {
      this.globalData.moveToke = options.query.move;
    }
    // 打开调试
    wx.setEnableDebug({
      enableDebug: false
    })
  },
  //封装请求
  //参数1:路径
  //参数2:请求参数
  //参数3:请求类型
  //参数4:成功回调函数(函数名为error时为失败回调函数,可选)
  //参数5:失败回调函数(可选)
  http: function () {
    var that = this;
    var thAM=arguments;
    var data = thAM[1];
    data.sessionid = that.globalData.loginInfo.sessionid;
    wx.request({
      method: thAM[2],
      url: thAM[0],
      data: data,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        var res=res.data; 
        if (res.code==200) {
          if (thAM[3] && thAM[3]['name'] != 'error') {
            thAM[3](res.data)
          }
        } else if(res.code==202){
          that.tishi('登录已失效',function(){
            //删除缓存的登录信息
            wx.removeStorage({
              key: 'loginInfo',
              success: function () {
                //跳转到登录页面
                wx.reLaunch({ url: '/pages/default/default' });
              }
            })
          })
        }else{
          if (thAM[4]) {
            thAM[4](res.data);
          } else if (thAM[3] && thAM[3]['name'] == 'error') {
            thAM[3](res.data);
          }
        }
      },
      fail: function () {
        that.error('网络错误');
      }
    })
  },
  //格式化HTML字符串
  formattedHTML: function (html) {
    return html.replace(/<[a-z]+/g, function (str) {
      switch (str) {
        case '<img':
          return '<img style="max-width:100%"';
          break;
        case '<table':
          return '<table style="border-spacing: 0px;width:94%;margin:3%"';
          break;
        case '<td':
          return '<td style="border:1px rgb(224,224,224) solid;"';
          break;
        default:
          return str;
          break;
      }
    })
  },
  //错误弹窗
  error:function(msg){
    wx.showToast({
      title: msg,
      image: '/images/error.png',
      duration: 2000
    })
  },
  //成功弹窗
  success:function(msg){
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 2000
    })
  },
  //警告框
  warn: function (msg) {
    wx.showToast({
      image: '/images/warn.png',
      title: msg,
      duration: 1000
    })
  },
  //提示框
  tishi:function(msg,callback){
    wx.showModal({
      title:'提示',
      showCancel:false,
      content:msg,
      success:function(res){
        typeof callback=="function"&&callback(res);
      }
    })
  }
})