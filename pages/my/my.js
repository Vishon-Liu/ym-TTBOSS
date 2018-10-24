// pages/my/my.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginInfo:[],
    murky:true,
    moveQrcord:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow:function(){
    this.setData({ loginInfo: app.globalData.loginInfo });
  },
  toDynamic(e){
    wx.navigateTo({
      url: './dynamic/dynamic',
    })
  },
  //跳转修改个人信息页面
  toSetting(e){
    wx.navigateTo({
      url: './setting/setting',
    })
  },
  toPoster(e){
    wx.navigateTo({
      url: './poster/poster',
    })
  },
  //关闭笼罩层
  close(){
    this.setData({ murky: !this.data.murky });
  },
  //生成一键转移二维码
  moveUser:function(){
    var img = "http://push.com/static/qrcode.jpg";
    this.setData({ moveQrcord: img, murky: !this.data.murky});
    console.log(234);
    // var that=this;
    // var url = app.d.hostUrl +'User/moveToke';
    // app.http(url,[],'get',function(res){
    //   that.setData({ moveQrcord:res});
    // })
  }
})