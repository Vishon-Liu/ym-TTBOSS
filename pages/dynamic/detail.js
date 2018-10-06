// pages/dynamic/detail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/companyDetails'
    app.http(url, { id: options.id},'get',function(res){
      console.log(res);
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})