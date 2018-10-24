// pages/my/poster/poster.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    this.setData({
      info: app.globalData.loginInfo
    }, function() {
      var info = that.data.info;
      console.log(app.globalData.loginInfo);
      wx.downloadFile({
        url: info.photo,
        success(res) {
          wx.downloadFile({
            url: info.qrcode,
            success(res) {
              console.log(res);
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                info.qrcode = res.tempFilePath;
                that.drawImg(info);
              }
            },
            fail(res) {
              console.log(res + '------' + info.qrcode);
            }
          })
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            info.photo = res.tempFilePath;

          }
        },
        fail(res) {
          console.log(res + '------' + info.photo);
        }
      })
    });
  },
  saveImage:function(){
    let that = this;
    var canvasTu = '';
    wx.canvasToTempFilePath({
      canvasId: 'firstCanvas',
      success: function (res) {
        console.log(res.tempFilePath)
        canvasTu = res.tempFilePath;
      } 
    })
    // 获取用户是否开启用户授权相册
    wx.getSetting({
      success(res) {
        console.log({'咋':res});
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              wx.saveImageToPhotosAlbum({
                filePath: canvasTu,
                success() {
                  wx.showToast({
                    title: '保存成功'
                  })
                },
                fail() {
                  wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                  })
                }
              })
            },
            fail() {
              // 如果用户拒绝过或没有授权，则再次打开授权窗口
              //（ps：微信api又改了现在只能通过button才能打开授权设置，以前通过openSet就可打开，下面有打开授权的button弹窗代码）
              that.setData({
                openSet: true
              })
            }
          })
        } else {
          // 有则直接保存
          wx.saveImageToPhotosAlbum({
            filePath: canvasTu,
            success() {
              wx.showToast({
                title: '保存成功'
              })
            },
            fail() {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  drawImg: function(info) {
    var width = 300,
      height = 190,
      cardWidth = 300,
      cardHeight = 390;
    this.setData({
      width: cardWidth,
      height: cardHeight
    });
    const ctx = wx.createCanvasContext('firstCanvas');
    ctx.setFillStyle('white'); //设置背景色
    ctx.fillRect(0, 0, cardWidth, cardHeight);
    //画背景图片
    ctx.drawImage('/images/card/background.png', 0, 0, width, height);
    ctx.setFillStyle('white'); //设置默认字体颜色
    //写公司名称
    var right = 20; //右边距
    var top = 30; // 顶部边距
    ctx.setFontSize(14)
    ctx.setTextAlign('right')
    ctx.fillText(info.company_name, width - right, top);
    ctx.save(); //保存一下剪裁前的图层
    //画圆形头像
    var photoLeft = 25; //头像左边距
    var photoTop = top + 10; //头像顶部边距
    var photoWidth = 60,
      photoHeight = 60; //头像高宽 
    //画头像的圆形线条
    ctx.beginPath();
    ctx.arc(photoLeft + photoWidth / 2, photoTop + photoHeight / 2,
      photoHeight / 2, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.stroke();
    //剪裁线条区域内的图像
    ctx.clip();

    ctx.drawImage(info.photo, photoLeft, photoTop, photoWidth, photoHeight);
    ctx.restore(); //恢复剪裁前的图层，与剪裁后的图层合并
    //写职位
    var titleLeft = photoLeft + photoWidth + 10; //职位左边距
    var titleTop = photoTop + 10; //职位顶部边距
    ctx.setFontSize(14);
    ctx.setTextAlign('left');
    ctx.fillText(info.info.job_title, titleLeft, titleTop);
    //写名称
    var nameLeft = titleLeft;
    var nameTop = titleTop + 20;
    ctx.setFontSize(14);
    ctx.fillText(info.nickname, nameLeft, nameTop);
    //画电话图标
    var telLeft = photoLeft; //电话图标左边距
    var telTop = photoTop + photoHeight + 10; //电话图标顶部边距
    var iconWidth = 15,
      iconHeight = 15; //图标宽、高度
    ctx.drawImage('/images/card/tel.png', telLeft,
      telTop, iconWidth, iconHeight);
    //写电话
    var telFLeft = telLeft + iconWidth + 10; //电话左边距
    var telFTop = telTop + 14; //电话顶部边距
    ctx.setFontSize(10);
    ctx.fillText(info.tel, telFLeft, telFTop);
    //画邮箱图标
    var mailLeft = telLeft; //邮箱图标左边距
    var mailTop = telTop + iconHeight + 5; //邮箱图标右边距
    ctx.drawImage('/images/card/envelope.png', mailLeft,
      mailTop, iconWidth, iconHeight);
    //写邮箱
    var mailFLeft = telFLeft; //邮箱左边距
    var mailFTop = mailTop + 14; //邮箱顶部边距
    ctx.setFontSize(10);
    ctx.fillText(info.info.mail, mailFLeft, mailFTop);
    //写地址图标
    var addressLeft = telLeft; //地址图标左边距
    var addressTop = mailTop + iconHeight + 5; //地址图标顶部边距
    ctx.drawImage('/images/card/address.png', addressLeft,
      addressTop, iconWidth, iconHeight);
    //写地址
    var addressFLeft = telFLeft; //地址左边距
    var addressFTop = addressTop + 14; //地址顶部边距
    ctx.fillText(info.address, addressFLeft, addressFTop);
    ctx.save(); //保存一下剪裁前的图层
    //画圆形二维码
    var qrWidth = 100,
      qrHeight = 100; //二维码宽高
    var qrLeft = (width - qrWidth) / 2; //二维码左边距
    var qrTop = height + 20; //二维码顶部边距
    //画二维码的圆形线条
    ctx.arc(qrLeft + qrWidth / 2, qrTop + qrHeight / 2,
      qrHeight / 2, 0, 2 * Math.PI);
    //剪裁线条区域内的图像
    ctx.clip();
    ctx.drawImage(info.qrcode, qrLeft, qrTop, qrWidth, qrHeight);
    ctx.restore(); //恢复剪裁前的图层，与剪裁后的图层合并
    // //写提示文字
    var TS = '长按识别二维码';
    //获取提示文字宽度
    const metrics = ctx.measureText(TS)
    ctx.setFillStyle('black');
    var TSLeft = (width - metrics.width) / 2; //地址左边距
    var TSTop = qrTop + qrHeight + 20; //地址顶部边距
    ctx.fillText(TS, TSLeft, TSTop);
    ctx.draw();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})