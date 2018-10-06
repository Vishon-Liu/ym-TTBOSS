// pages/product/product.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    murky:true,
    behavior:[],
    client:[],
    startTime:'',
    showCalendar:false,
    currentDate:"",
    nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }],
    current:0,
  },
  // 选项卡
  swichNav: function (e) {
    console.log(e);
    var that = this;
    that.setData({ current: e.currentTarget.dataset.current});
    console.log(that.data.current);
    that.behavior(e.currentTarget.dataset.current);
  },
  // 打开日历
  calendar(){
    this.setData({ murky: !this.data.murky, showCalendar: !this.data.showCalendar});
  },
  // 监听点击日历上下个月的事件
  monitorMonth(e){
    var that = this;
    console.log(e);
    var month = new Date;
    month = month.getMonth()+1;
    if (e.detail.currentMonth == month){
      that.setData({ 
        nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]
      });
    }else{
      that.setData({
        nowDateStyle: []
      });
    }
  },
  // 监听点击日历具体某一天的事件
  dayClick(e){
    var that = this;
    console.log(e);
    var day = e.detail.day, month = e.detail.month, year = e.detail.year;
    console.log(year+'-'+month+'-'+day);
    var date = year + '-' + month + '-' + day;
    that.setData({
      startTime: date,
    });
    var nowMonth = new Date;
    nowMonth = nowMonth.getMonth() + 1;
    if (nowMonth==month){
      that.setData({
        nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]
          .concat({ month: 'current', day: day, color: 'white', background: '#FF72A6' })
      });
    }else{
      that.setData({
        nowDateStyle: [].concat({ month: 'current', day: day, color: 'white', background: '#FF72A6' })
      });
    }
    that.behavior(that.data.current);
    that.close();
  },
  // 关闭日历
  close(){
    this.setData({ murky: true, showCalendar: false});
  },
  // 选项页
  bindChange: function (e) {
    this.setData({
      current: e.detail.current,
      // currentTab: e.detail.current
    })
  },
  //跳转到 行为详情页 || 客户行为页
  jump:function(e){
    console.log(e);
    if (this.data.current == 1){
      wx.navigateTo({
        url: './client?id=' + e.currentTarget.dataset.id,
      })
    }else{
      wx.navigateTo({
        url: './detail?title=' + e.currentTarget.dataset.check + '&type=' + e.currentTarget.dataset.type,
      })
    }
  },
  // 查询某个日期的全部行为次数||全部客户人数
  behavior(e){
    var that = this;
    var url = e == 1 ? app.d.hostUrl + 'UserBehavior/clientCnt' 
      : app.d.hostUrl + 'UserBehavior/typeCnt';
    app.http(url, { startTime: that.data.startTime }, 'get', function (res) {
      console.log(res);
      if (e==1){
        that.setData({ client:res});
      }else{
        that.setData({ behavior: res });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(app.globalData)
    //例
    // var url = app.d.hostUrl +'UserBehavior/checkToken';
    // app.http(url,[],'get',function(res){
    //   console.log(res);
    // })
    //第一次查询所有行为的全部次数
    that.behavior(that.data.current);
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})