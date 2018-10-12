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
    var index = e.currentTarget.dataset.index;
    this.data.personDynamic[index]['showLike'] = !this.data.personDynamic[index]['showLike']
    console.log({ '对了': e, '阿萨德': this.data.personDynamic[index]['showLike'] });
    var personDynamic = this.data.personDynamic;
    var id = app.globalData.loginInfo.id;
    console.log({ '点赞': e });
    console.log({"用户id":app.globalData.loginInfo});
    if (personDynamic[index]['user_like'][id]){
      console.log({'已点赞': personDynamic[index]['user_like'][id]});
      delete personDynamic[index]['user_like'][id];
      personDynamic[index].is_like=0;
      app.http(app.d.hostUrl + 'Dynamic/noLike', { id: personDynamic[index].id }, 'post');
      this.setData({ personDynamic: personDynamic})
    }else{
      console.log({'没点赞': personDynamic[index]})
      //对象数组     [下标]     [属性]       { [对象属性] :对象值}
      personDynamic[index]['user_like']={ [id] : personDynamic[index].nickname};
      console.log({ 'now': personDynamic[index] });
      personDynamic[index].is_like = 1;//先本地修改点赞状态
      app.http(app.d.hostUrl + 'Dynamic/like', { id: e.currentTarget.dataset.id }, 'post');//再将状态发给服务器
      this.setData({ personDynamic: personDynamic})
    }
  },
  // 评论留言
  clickMsg(e){
    console.log({"评论键盘升起":e});
  },
  // 动态请求
  dynamicsRequest() {
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/person',
        data = { page: that.data.page };
    app.http(url, data, 'get', function (res) {
      console.log({ '动态列表': res });
      //遍历数据列表 更改列表里的一项属性值(时间的显示)
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
      //判断数据量 然后根据数据量控制页底的显示与提示
      if (that.data.page == 1 && res.length<10){ 
        that.setData({ load: false, tip: '目前没有了', personDynamic: that.data.personDynamic.concat(res) });
      } else if (res.length < 10){
        that.setData({ load: false, tip: '已经到底了', personDynamic: that.data.personDynamic.concat(res) });
      } else {
        that.setData({ load: true, tip: '正在加载', personDynamic: that.data.personDynamic.concat(res) });
      }
      //给动态列表 添加一个属性 该属性用于控制页面是否显示点赞栏
      that.data.personDynamic.forEach(v=>{
        v['showLike'] = Object.keys(v.user_like).length !== 0;
      });
      that.setData({ personDynamic: that.data.personDynamic });
      console.log({ 'personDynamic': that.data.personDynamic });
    },function(res){//查不到数据的函数 提示异常
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