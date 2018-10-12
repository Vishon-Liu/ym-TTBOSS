// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  toDynamic(e){
    wx.navigateTo({
      url: './dynamic/dynamic',
    })
  },
  toSetting(e){
    wx.navigateTo({
      url: './setting/setting',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  }
})