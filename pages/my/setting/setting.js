// pages/my/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:null,
  },
  //自定义点击事件
  setVia:function(e){
    var imgList =['http://00imgmini.eastday.com/mobile/20180819/20180819160953_60019212ae3002d4179de20ac20a29a1_2.jpeg'];
    wx.previewImage({
      urls: imgList,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  }
})