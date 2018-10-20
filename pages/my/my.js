// pages/my/my.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginInfo:[],
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
  //生成一键转移二维码
  moveUser:function(){
    var that=this;
    var url = app.d.hostUrl +'User/moveToke';
    app.http(url,[],'get',function(res){
      that.setData({ moveQrcord:res});
    })
  }
})