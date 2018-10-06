// pages/index/client.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    murky: true,
    id:'',
    page:1,
    load:true,
    startTime:'',
    behavior:[],
    showCalendar: false,
    tip: '',
    nowDateStyle: [{ month: 'current', day: new Date().getDate(), color: 'white', background: '#AAD4F5' }],
  },
  // 打开日历
  calendar() {
    this.setData({ murky: !this.data.murky, showCalendar: !this.data.showCalendar });
  },
  // 关闭日历
  close() {
    this.setData({ murky: true, showCalendar: false });
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
    console.log({'去玩儿':date});
    that.setData({
      startTime: date,
      page: 1,
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
        nowDateStyle: [].concat({ month: 'current', day: day, color: 'white', background: '#FF72A6' })
      });
    }

    that.behaviorQuery();
    that.close();
  },
  //客户查询
  behaviorQuery() {
    var that = this;
    var url = app.d.hostUrl + 'UserBehavior/clientDetails';
    var data = { 'id': that.data.id, 'page': that.data.page, 'startTime': that.data.startTime};
    app.http(url,data,'get',function(res){
      console.log({ '转换前': res });
      var newRes = res.filter(function(e){
        switch (e.type) {
          case 1:
            e.type = '查看了官网';
            break;
          case 2:
            e.type = '复制了你的微信';
            break;
          case 3:
            e.type = '转发了你的名片';
            break;
          case 4:
            e.type = '查看了你的名片';
            break;
          case 5:
            e.type = '咨询了商品';
            break;
          case 6:
            e.type = '点击了喜欢';
            break;
          case 7:
            e.type = '拨打了你的电话';
            break;
          case 8:
            e.type = '查看了你的动态';
            break;
          case 9:
            e.type = '保存了你的电话';
            break;
        }
        return e;
      });
      console.log({ '转换后': newRes});
      that.setData({
        tip: '玩命加载...',
        behavior: that.data.behavior.concat(newRes)
      });
    },function(res){
      console.log(res);
      if (that.data.page > 1) {
        var newRes = res.filter(function (e) {
          switch (e.type) {
            case 1:
              e.type = '查看了官网';
              break;
            case 2:
              e.type = '复制了你的微信';
              break;
            case 3:
              e.type = '转发了你的名片';
              break;
            case 4:
              e.type = '查看了你的名片';
              break;
            case 5:
              e.type = '咨询了商品';
              break;
            case 6:
              e.type = '点击了喜欢';
              break;
            case 7:
              e.type = '拨打了你的电话';
              break;
            case 8:
              e.type = '查看了你的动态';
              break;
            case 9:
              e.type = '保存了你的电话';
              break;
          }
          return e;
        });
        that.setData({ load: false, tip: '已经没有了', behavior: that.data.behavior.concat(res) });
      } else {
        that.setData({ load: false, tip: '暂无数据', behavior: res });
      }
    });
  },
  // 加载下一页
  nextPage(e) {
    var that = this;
    if (that.data.load) {
      that.setData({ page: that.data.page + 1 });
    }
    console.log(that.data.page);
    that.behaviorQuery(that.data.type);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log({'用户ID':options});
    that.setData({ id: options.id});
    that.behaviorQuery();
  },
})