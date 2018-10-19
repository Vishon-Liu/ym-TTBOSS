// pages/dynamic/detail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:'',
    loginInfo:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({loginInfo:app.globalData.loginInfo})
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/companyDetails'
    app.http(url, { id: options.id},'get',function(res){
      res.details = app.formattedHTML(res.details);
      console.log(res);
      that.setData({data:res})
    });
  },
})