// pages/my/dynamic/dynamic.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    show: false,
    tip: '',
    load: true,
    murky: true,
    personDynamic: [],
    animationData: {},
  },

  //跳发布页
  promulgate(){
    wx.navigateTo({
      url: 'promulgate/promulgate',
    })
  },
  //评论收起
  close() {
    this.showPl();
  },
  // 弹出评论
  showPl: function () {
    this.setData({ show: !this.data.show, murky: !this.data.murky });
    var animation = wx.createAnimation({     //评论动画   点击弹出缩入
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: "linear",
      delay: 0
    });
    if (this.data.show) {
      animation.translate('-9rem').step();
      this.setData({
        animationData: animation.export()
      })
    } else {
      animation.translate('0rem').step();
      this.setData({
        animationData: animation.export()
      })
    }
  },
  //下拉加载更多
  loadMore(e) {
    var that = this;
    console.log({ '加载更多': e });
    if (that.data.load) {
      that.setData({ page: that.data.page + 1 });
    }
  },
  // 跳转到详情
  toDetail(e) {
    console.log({ '跳转到详情': e });
    wx.navigateTo({
      url: './detail?id=' + e.currentTarget.dataset.id,
      fail: function (res) {
        console.log({ 'kjbo': res });
      }
    })
  },
  // 点赞
  clickLike(e) {
    console.log({ '点赞': e });
    if (e.currentTarget.dataset.islike == 1) {
      var url = app.d.hostUrl + 'Dynamic/noLike',
        data = { 'id': e.currentTarget.dataset.id };
      app.http(url, data, 'post');
    } else {
      var url = app.d.hostUrl + 'Dynamic/like',
        data = { 'id': e.currentTarget.dataset.id };
      app.http(url, data, 'post');
    }
  },
  // 评论留言
  clickMsg(e){
    console.log(e);
  },
  // 动态请求
  dynamicsRequest() {
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/person',
      data = { page: that.data.page };
    app.http(url, data, 'get', function (res) {
      console.log({ '动态列表': res });
      res.forEach(v => {    //改变时间显示方式
        var timeArr = v.add_time.split(" ");
        // console.log({ '时间数组': timeArr});
        var oldFormat = v.add_time;
        // console.log({ '旧格式': oldFormat});
        var newFormat = oldFormat.replace(new RegExp("-", "g"), "/"); //用正则转换格式
        // console.log({ '新格式': newFormat });
        var getMs = (new Date(newFormat)).getTime(); //得到毫秒数
        // console.log({ '指定毫秒数': getMs });
        var nowMs = new Date().getTime();
        // console.log({ '当前毫秒数': nowMs });
        var timeLag = nowMs/1000 - getMs/1000;
        if (timeLag>86400){   //判读时间距今超多一天没有
          v.add_time = timeArr[0];
        }else{
          v.add_time = timeArr[1];
        }
      });
      that.setData({ load: true, tip: '正在加载',personDynamic: that.data.personDynamic.concat(res)});
      console.log({ 'personDynamic': that.data.personDynamic });
    },function(res){
      console.log({ '异常': res });
      if (that.data.page > 1) {
        that.setData({ load: false, tip: '已经没有了', personDynamic: that.data.personDynamic.concat(res) });
      } else {
        that.setData({ load : false, tip: '暂无数据', personDynamic : res });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.dynamicsRequest();
  }
})