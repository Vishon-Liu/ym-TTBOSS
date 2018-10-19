// pages/message/message.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:0,
    list:[],
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
    this.userRecord();
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
  //查询用户消息记录
  userRecord:function(){
    this.setData({'list':1})
    console.log(this.data)

    var that=this;
    var url = app.d.hostUrl +'User/relevanceUser';
    app.http(url,[],'get',function(res){
      console.log(res);
      that.setData({
        'list':res
      })
    })
  }
  
})