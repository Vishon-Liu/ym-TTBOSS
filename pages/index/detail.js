// pages/index/detail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    murky: true,
    title:'',
    'type':'',
    behavior:[],
    page:1,
    behaviorType:'',
    load:true,
    reset:false,
    startTime: '',
    showCalendar: false,
    nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }],
    tip:'',
  },
  // 打开日历
  calendar() {
    this.setData({ 
      murky: !this.data.murky, 
      showCalendar: !this.data.showCalendar ,
      reset:true
    });
  },
  resetDate(){
    var that = this;
    that.setData({ startTime: '', nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]});
    that.behaviorQuery();
    that.close();
  },
  // 关闭日历
  close() {
    this.setData({ murky: true, showCalendar: false, reset:false});
  },
  // 监听点击日历上下个月的事件
  monitorMonth(e) {
    var that = this;
    console.log(e);
    var month = new Date;
    month = month.getMonth() + 1;
    if (e.detail.currentMonth == month) {
      that.setData({
        nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]
      });
    } else {
      that.setData({
        nowDateStyle: []
      });
    }
  },
  // 监听点击日历具体某一天的事件
  dayClick(e) {
    var that = this;
    console.log(e);
    var day = e.detail.day, month = e.detail.month, year = e.detail.year;
    console.log(year + '-' + month + '-' + day);
    var date = year + '-' + month + '-' + day;
    that.setData({
      behavior:[],
      startTime: date,
      page:1,
    });
    var nowMonth = new Date;
    nowMonth = nowMonth.getMonth() + 1;
    if (nowMonth == month) {
      that.setData({
        nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]
          .concat({ month: 'current', day: day, color: 'white', background: '#FF72A6' })
      });
    } else {
      that.setData({
        nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }]
          .concat({ month: month, day: day, color: 'white', background: '#FF72A6' })
      });
    }
    that.behaviorQuery();
    that.close();
  },
  // 行为查询
  behaviorQuery(){
    var that = this;
    var url = app.d.hostUrl + 'UserBehavior/typeDetails';
    app.http(url, { 'type': that.data.type, 'page': that.data.page, 'startTime': that.data.startTime},
    'get',function(res){
      console.log(res);
      if (that.data.page == 1 && res.length < 10) {
        that.setData({ load: false, tip: '目前没有了', behavior: that.data.behavior.concat(res) });
      } else if (res.length < 10) {
        that.setData({ load: false, tip: '已经到底了', behavior: that.data.behavior.concat(res) });
      } else {
        that.setData({ load: true, tip: '正在加载', behavior: that.data.behavior.concat(res) });
      }
      console.log({ 'behavior': that.data.behavior });
      // that.setData({
      //   tip: '玩命加载...',
      //   behavior: that.data.behavior.concat(res)
      // });
    },function(res){
      console.log({ '异常': res });
      if (that.data.page > 1){
        that.setData({ load: false, tip: '已经没有了', behavior: that.data.behavior.concat(res) });
      }else{
        that.setData({ load: false, tip: '暂无数据', behavior: res });
      }
    });
  },
  // 加载下一页
  nextPage(e){
    var that = this;
    console.log({ '加载更多': e });
    if (that.data.load){
      that.setData({ page: that.data.page + 1 });
    }
    if (that.data.page!=1){
      that.behaviorQuery();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log({ 'options': options});
    that.setData({ title: options.title, 'type': options.type, behaviorType: options.behaviorType});
    //改变顶部标题
    wx.setNavigationBarTitle({
      title: options.title,
      success: function () {
        console.log('标题ok');
      },
    });
    that.behaviorQuery();
  },
})