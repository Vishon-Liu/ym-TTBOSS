// pages/default/default.js
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    login:true,
    disabled:false,
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    var that=this;
    //尝试获取缓存的登录信息
    wx.getStorage({
      key:'loginInfo',
      success:function(res){
        //获取缓存成功
        var loginInfo = res.data;
        //判断缓存是否已超时
        if (loginInfo.valid_time > new Date().getTime()){
          app.globalData.loginInfo = res.data;
          wx.switchTab({ url: '/pages/index/index' });
        }else{
          that.userBasicInfo();
        }    
      },
      fail: function () {
        that.userBasicInfo();
      }
    })
  },
  //获取用户基本信息
  userBasicInfo:function(){
    var that=this;
    //检测是否已授权用户基本信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo;
              that.promiseLogin();
            }
          })
          console.log('授权');
        } else {
          this.setData({ 'login': false });
          console.log('未授权')
        }
      }
    })
  },
  //流程化登录
  promiseLogin:function(){
    var that = this;  
    wx.showLoading({ title: '登录中' });
    //获取用户基本信息
    that.login().then(function (res) {
      wx.hideLoading();
      //根据返回值做操作
      if (res.code == 200) {
        //登录成功跳转，缓存和全局变量写入通信ID，跳转首页
        app.globalData.loginInfo = res.data;
        //设置有效时间为20小时
        res.data.valid_time = new Date().getTime() + 72000000;
        wx.setStorage({ key: 'loginInfo', data: res.data });
        wx.switchTab({ url: '/pages/index/index' });
      } else if (res.code == 210) {
        //获取关联凭证，跳转关联页面
        wx.redirectTo({
          url: '/pages/personal/personal?sessionid=' + res.data,
        })
      }
    }).catch(function (res) {
      wx.hideLoading();
      //未成功执行以上场景，所以是未受邀用户，显示未受邀窗口
      that.setData({ login: true })
      console.log(res)
    });
  },
  //请求用户授权
  RequestAuth: function (e) {
    var that = this; 
    //解决授权访问怎么都可以两次提交问题,不可以删除
    if (this.data.disabled)return false;
    this.setData({ disabled: true });
    if (e.detail.iv) {  
      //授权成功,从登录接口开始执行
      app.globalData.userInfo = e.detail.userInfo;
      that.promiseLogin();
    }else{
      //拒绝授权
      this.setData({ disabled:false});
    }
  },
  //用户登录
  login: function () {
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          var data = app.globalData.userInfo;
          data.token = app.globalData.token;
          data.code = res.code;
          wx.request({
            method: 'post',
            url: app.d.hostUrl + 'index/login',
            data: data,
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function (res) {
              var res = res.data;
              if (res.code == 201) {
                app.error(res.msg);
                reject(res.msg);
              } else {
                resolve(res);
              }
            }
          })
        }
      })
    })
  },
  
})