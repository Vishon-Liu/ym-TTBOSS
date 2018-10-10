// pages/my/dynamic/dynamic.js
const { $Message } = require('../../../dist/base/index');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    thisDH:'',
    show: false,
    tip: '',
    showDelModal:false,
    load: true,
    murky: true,
    personDynamic: [],
    animationData: {},
    delID:'',
    actions: [
      {
        name: '取消'
      },
      {
        name: '删除',
        color: '#ed3f14',
        loading: false
      }
    ]
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
  showPl(e) {
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
        animationData: animation.export(),
        thisDH:e.currentTarget.dataset.id
      })
    } else {
      animation.translate('0rem').step();
      this.setData({
        animationData: animation.export(),
      })
      console.log(this.data.animationData);
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
      if (that.data.page == 1 && res.length<10){
        that.setData({ load: false, tip: '目前没有了', personDynamic: that.data.personDynamic.concat(res) });
      } else if (res.length < 10){
        that.setData({ load: false, tip: '已经到底了', personDynamic: that.data.personDynamic.concat(res) });
      } else {
        that.setData({ load: true, tip: '正在加载', personDynamic: that.data.personDynamic.concat(res) });
      }
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
  //删除模态框
  delModal(e){
    this.setData({ showDelModal: true, delID: e.currentTarget.dataset.id});
  },
  //动态删除 确认
  delDynamic({ detail }) {
    var that = this;
    if (detail.index === 0) {
      this.setData({
        showDelModal: false
      });
    } else {
      const action = [...this.data.actions];
      action[1].loading = true;
      for (var i = 0; i < that.data.personDynamic.length; i++) {
        if (that.data.delID == that.data.personDynamic[i].id) {
          that.data.personDynamic.splice(i, 1);
          console.log({'id': that.data.delID});
          app.http(app.d.hostUrl + 'Dynamic/del', { id: that.data.delID }, 'post');
          that.setData({ personDynamic: that.data.personDynamic, actions: action});
        }
      }

      setTimeout(() => {
        action[1].loading = false;
        this.setData({
          showDelModal: false,
          actions: action
        });
        $Message({
          content: '删除成功！',
          type: 'success'
        });
      }, 500);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.dynamicsRequest();
  }
})