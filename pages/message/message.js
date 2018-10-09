// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:0,
  },

  toDetail(){
    wx.navigateTo({
      url: 'detail/detail',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that = this;
    // var timestamp = Date.parse(new Date());
    // var lastTime = 1531806085;
    // timestamp = timestamp / 1000;
    // console.log("当前时间戳为：" + timestamp);
    // timestamp = timestamp - lastTime;
    // console.log("当前时间戳为：" + timestamp);
    // switch (timestamp) {
    //   case timestamp<36000:
    //     that.setData({time:"一小时前"});
    //     break;
    //   case timestamp > 36000 && timestamp<864000:
    //     that.setData({ time: "昨天" });
    //     break;
    //   default:
    //     that.setData({ time: "不知道多久" });
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})