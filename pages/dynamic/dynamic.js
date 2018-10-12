// pages/dynamic/dynamic.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    thisDH: '',
    show:false,
    tip:'',
    load: true,
    murky: true,
    companyDynamic:[],
    animationData:{},
  },
  //评论收起
  close() {
    this.showPl();
  },
  // 弹出评论
  showPl(e){
    this.setData({ show: !this.data.show, murky: !this.data.murky});
    var animation = wx.createAnimation({     //评论动画   点击弹出缩入
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: "linear",
      delay: 0
    });
    if(this.data.show){
      animation.translate('-9rem').step();
      this.setData({
        animationData: animation.export(),
        thisDH: e.currentTarget.dataset.id
      })
    }else{
      animation.translate('0rem').step();
      this.setData({
        animationData: animation.export()
      })
      console.log(this.data.animationData);
    }
  },
  // 跳转到详情
  toDetail(e){
    console.log({'跳转到详情':e});
    wx.navigateTo({
      url: './detail?id=' + e.currentTarget.dataset.id,
      fail:function(res){
        console.log({'kjbo':res});
      }
    })
  },
  //下拉加载更多
  loadMore(e){
    var that = this;
    console.log({'加载更多':e});
    if (that.data.load) {
      that.setData({ page: that.data.page + 1 });
    }
  },
  // 点赞
  clickLike(e) {
    var index = e.currentTarget.dataset.index;
    this.data.companyDynamic[index]['showLike'] = !this.data.companyDynamic[index]['showLike']
    console.log({ '对了': e, '阿萨德': this.data.companyDynamic[index]['showLike'] });
    var companyDynamic = this.data.companyDynamic;
    var id = app.globalData.loginInfo.id;
    console.log({ '点赞': e });
    console.log({ "用户id": app.globalData.loginInfo });
    if (companyDynamic[index]['user_like'][id]) {
      console.log({ '已点赞': companyDynamic[index]['user_like'][id] });
      delete companyDynamic[index]['user_like'][id];
      companyDynamic[index].is_like = 0;
      app.http(app.d.hostUrl + 'Dynamic/noLike', { id: companyDynamic[index].id }, 'post');
      this.setData({ companyDynamic: companyDynamic })
    } else {
      console.log({ '没点赞': companyDynamic[index] })
      //对象数组     [下标]     [属性]       { [对象属性] :对象值}
      companyDynamic[index]['user_like'] = { [id]: app.globalData.loginInfo.nickname };
      console.log({ 'now': companyDynamic[index] });
      companyDynamic[index].is_like = 1;//先本地修改点赞状态
      app.http(app.d.hostUrl + 'Dynamic/like', { id: e.currentTarget.dataset.id }, 'post');//再将状态发给服务器
      this.setData({ companyDynamic: companyDynamic })
    }
  },
  // 评论
  clickMsg(e){
    console.log({'评论':e});
  },
  // 动态请求
  dynamicsRequest(){
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/company',
        data = { page:that.data.page };
    app.http(url,data,'get',function(res){
      console.log({'动态列表':res});
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
        var timeLag = nowMs / 1000 - getMs / 1000;
        if (timeLag > 86400) {   //判读时间距今超多一天没有
          v.add_time = timeArr[0];
        } else {
          v.add_time = timeArr[1];
        }
      });
      //判断数据量 然后根据数据量控制页底的显示与提示
      if (that.data.page == 1 && res.length < 10) {
        that.setData({ load: false, tip: '目前没有了', companyDynamic: that.data.companyDynamic.concat(res) });
      } else if (res.length < 10) {
        that.setData({ load: false, tip: '已经到底了', companyDynamic: that.data.companyDynamic.concat(res) });
      } else {
        that.setData({ load: true, tip: '正在加载', companyDynamic: that.data.companyDynamic.concat(res) });
      }
      //给动态列表 添加一个属性 该属性用于控制页面是否显示点赞栏
      that.data.companyDynamic.forEach(v => {
        v['showLike'] = Object.keys(v.user_like).length !== 0;
      });
      that.setData({ companyDynamic: that.data.companyDynamic });
      console.log({ 'companyDynamic': that.data.companyDynamic });
    },function(res){
      console.log({ '异常': res });
      if (that.data.page > 1) {
        that.setData({ load: false, tip: '已经没有了', companyDynamic: that.data.companyDynamic.concat(res) });
      } else {
        that.setData({ load: false, tip: '暂无数据', companyDynamic: res });
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