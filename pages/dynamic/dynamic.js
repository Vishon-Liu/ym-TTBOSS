// pages/dynamic/dynamic.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginInfo:'',
    page:1,
    thisDH: '',
    show:false,
    tip:'',
    load: true,
    murky: true,
    companyDynamic:[],
    animationData:{},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'loginInfo': app.globalData.loginInfo,
    })
    this.dynamicsRequest();  
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
    var beforePage = that.data.page;
    console.log({ '之前页': that.data.page });
    if (that.data.load) {
      that.setData({ page: that.data.page + 1 });
    }
    if (that.data.page != beforePage) {
      that.dynamicsRequest();
    }
  },
  // 点赞
  clickLike(e) {
    var id = this.data.loginInfo['id'];
    var nickname=this.data.loginInfo['nickname'];
    var index = e.currentTarget.dataset.index;
    var companyDynamic = this.data.companyDynamic;
    companyDynamic[index]['is_like'] = 1;
    if (companyDynamic[index]['user_like'].length == undefined){
      companyDynamic[index]['user_like'][id] = nickname;
    }else{
      companyDynamic[index]['user_like'] = { [id]: nickname} ;
    }
    companyDynamic[index]['showLike'] = true;
    var data = { id: companyDynamic[index].id }
    app.http(app.d.hostUrl + 'Dynamic/like', data, 'post');
    this.setData({ companyDynamic: companyDynamic });
  },
  //取消点赞
  noLike(e){
    var id = this.data.loginInfo['id'];
    var index = e.currentTarget.dataset.index;
    var companyDynamic = this.data.companyDynamic;
    companyDynamic[index]['is_like']=0;
    delete companyDynamic[index]['user_like'][id];
    var showLike=false;
    for (var i in companyDynamic[index]['user_like']){
      showLike=true;break;
    }
    companyDynamic[index]['showLike'] = showLike;
    var data = { id: companyDynamic[index].id }
    app.http(app.d.hostUrl + 'Dynamic/noLike',data , 'post');
    this.setData({ companyDynamic: companyDynamic });
  },
  // 评论
  clickMsg(e){
    console.log({'评论':e});
  },
  // 评论折叠
  loadAll(e){
    console.log(e);
    this.setData({ condition: !this.data.condition});
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
  
})