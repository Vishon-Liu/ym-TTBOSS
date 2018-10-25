// pages/my/my.js
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
  //页面的初始数据
  data: {
    loginInfo:[],
    murky:true,
    moveQrcord:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.loginInfo)
    
    
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
  onShow:function(){
    this.setData({ loginInfo: app.globalData.loginInfo });
  },
  toDynamic(e){
    wx.navigateTo({
      url: './dynamic/dynamic',
    })
  },
  //跳转修改个人信息页面
  toSetting(e){
    wx.navigateTo({
      url: './setting/setting',
    })
  },
  toPoster(e){
    wx.navigateTo({
      url: './poster/poster',
    })
  },
  //关闭笼罩层
  close(){
    this.setData({ murky: !this.data.murky });
  },
  //生成一键转移二维码
  moveUser:function(){
    // var img = "http://image.ymindex.com/static/images/photo/20181024/S15n403f79u7t9R9.png";
    // this.setData({ moveQrcord: img, murky: !this.data.murky});
   
    var that=this;
    var url = app.d.hostUrl +'User/moveToke';
    app.http(url,[],'get',function(res){
      that.setData({ moveQrcord: res, murky: !that.data.murky});
    })
    this.startLient();
  },
  //开启监听
  startLient:function(){
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
      if (data.type == "moveCall") {
        app.tishi('转移成功', function () {
          wx.clearStorage({
            success: function () {
              wx.reLaunch({ url: "/pages/default/default" })
            }
          })
        })
      }
    })
    //监听WebSocket 服务器的连接关闭
    wx.onSocketClose(function (e) {
      console.log(e)
    })
  },
  onHide:function(){
    //删除worker进程
    if (worker){
      worker.terminate();
      //删除WebSocket进程
      msg.close();
    }
    
    
  }
})