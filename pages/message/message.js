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

  toDetail(e){
    var index = e.currentTarget.dataset.index;
    var node=this.data.list[index];
    var data={'id':node.id,'nickname':node.nickname,'photo':node.photo};
    wx.navigateTo({
      url: 'detail/detail?user=' +JSON.stringify(data),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.userRecord();
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