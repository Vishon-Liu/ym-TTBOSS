// pages/default/default.js
//定义worker进程变量
var worker = '';
//引用CryptoJS加密插件
const CryptoJS = require('../../utils/aes.min.js');
const app = getApp();
//消息对象
const msg = {
  //心跳消息
  ping: function () {
    var data = { 'type': 'ping', 'msg': '233' };
    this.send(data);
  },
  //转移回调
  moveCall: function () {
    var data = { 'type': 'moveCall', 'msg': 'ok' };
    this.send(data);
  },
  //关闭通讯
  close: function () {
    var data = { 'x': '123' };
    this.send(data);
  },
  //登录消息
  login: function () {
    var data = {
      'type': 'login',
      'from_uid': parseInt(app.globalData.loginInfo.id),
      'to_uid': 0,
      'grade': 'moveStaff',
      'key': app.globalData.loginInfo.socket
    };
    this.send(data);
  },
  //发送消息
  send: function (data) {
    var msg = JSON.stringify(data);
    console.log('发送：' + msg);
    wx.sendSocketMessage({
      'data': msg,
      success: function () {
        worker.postMessage({ 'handle': 'clear' })
      }
    });
  },
};
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
        } else {
          this.setData({ 'login': false });
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
      }else if(res.code==220){
        //登录成功跳转，缓存和全局变量写入通信ID，跳转首页
        app.globalData.loginInfo = res.data;
        //设置有效时间为20小时
        res.data.valid_time = new Date().getTime() + 72000000;
        wx.setStorage({ key: 'loginInfo', data: res.data });
        //通讯转移成功
        that.startLient();
      }else{
        this.setData({ 'login': true });
      }
    }).catch(function (res) {
      wx.hideLoading();
      //未成功执行以上场景，所以是未受邀用户，显示未受邀窗口
      that.setData({ login: true })
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
          data.moveToke=app.globalData.moveToke;
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
  //获取WebSocket通讯凭证
  token: function (time) {
    var text = app.globalData.loginInfo.sessionid + time;
    //注意密钥的个数是4的倍数
    var key = CryptoJS.enc.Utf8.parse('1aA.5-x@cxbv7856');
    var ciphertext = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.ZeroPadding
    }).toString();
    var words = CryptoJS.enc.Utf8.parse(ciphertext);
    //base64加密编码，避免提交后台的时候包含转义字符导致解码失败 
    return CryptoJS.enc.Base64.stringify(words)
  },
  //开启监听
  startLient: function () {
    var that = this;
    //创建worker进程
    worker = wx.createWorker('workers/fib/index.js');
    //获取worker进程返回的消息
    worker.onMessage((res) => {
      //console.log(res)
      //发送心跳
      if (res.handle == 'ping') msg.ping();
    })
    wx.request({
      url: app.d.hostUrl + 'index/time',
      success: function (res) {
        //创建WebSocket
        wx.connectSocket({
          url: "wss://push.ymindex.com/wss/webSocketServer?token="
            + that.token(res.data),
        })
      }
    })
    //连接WebSocket成功
    wx.onSocketOpen(function (e) {
      console.log('连接成功')
      msg.login()
    })
    //监听WebSocket 接受到服务器的消息
    wx.onSocketMessage(function (e) {
      console.log(e)
      var data = JSON.parse(e.data);
      if (data.type == "login") {
        msg.moveCall();
        wx.switchTab({ url: '/pages/index/index' });
      }
    })
  },
})