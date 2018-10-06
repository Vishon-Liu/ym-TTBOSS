// pages/my/dynamic/promulgate/promulgate.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thumbWidth: 450,//压缩宽度
    thumbHeight: 0,//压缩高度
    current: 0,//照片当前指标数
    photo:[],
    msg:'',
  },

  //发布
  promulgate(){
    console.log({'msg':this.data.msg,'photo':this.data.photo});
    var that = this;
    var url = app.d.hostUrl + 'Dynamic/add';
    var data = { 'content': that.data.msg, 'photo_wall':that.data.photo};
    if (this.data.msg){
      app.http(url, data, 'post', function (res) {
        wx.navigateTo({
          url: '../dynamic',
        })
      });
      // return console.log('ojbk');
    }else{
      app.warn('写点想法吧');
    }
  },
  //获取输入内容
  bindInput(e){
    this.setData({msg:e.detail.value});
  },
  //点击添加图片
  pushPhoto(){
    var that = this, max=9;
    max -= that.data.photo.length;
    wx.chooseImage({
      count: max,
      sizeType: ['compressed'],
      success: function(res) {
        console.log({ '选择图片的返回数据': res });
        res.tempFilePaths.forEach(v => {
          console.log({'遍历每一张图':v});
          that.compress(v, '450', false, function (res) {
            that.setData({
              photo: that.data.photo.concat(res.tempFilePath)
            });
          });
        })
      },
    })
  },
  // 压缩图片
  //file图片文件(必选)
  //maxWidth限制宽度(必选)
  //maxHeight限制高度(可选)
  //callback压缩完成回调方法(可选)
  compress(file, maxWidth, maxHeight, callback) {    //接收传过来的图片
    var that = this;
    //获取原图片信息
    wx.getImageInfo({
      src: file,
      success: function (res) {
        var width = res.width, height = res.height;
        if (width > maxWidth) {
          //超出限制宽度
          height = (maxWidth / width) * height;
          width = parseInt(maxWidth);
        }
        if (res.height > maxHeight && maxHeight) {
          //超出限制高度
          var ratio = that.data.thumbHeight / res.height;//计算比例
          width = (maxHeight / height) * width.toFixed(2);
          height = maxHeight.toFixed(2);
        }

        that.setData({ thumbWidth: width, thumbHeight: height });

        //按比例压缩图片
        const ctx = wx.createCanvasContext('firstCanvas');
        ctx.drawImage(file, 0, 0, width, height);
        ctx.draw(false, function () {
          //绘画完成回调
          //生成图片
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {
              typeof callback == "function" && callback(res);
            }
          })
        });
      }
    })
  },
  //预览照片墙
  showPhoto() {
    wx.previewImage({
      urls: this.data.photo,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  }
})