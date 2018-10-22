// pages/my/dynamic/promulgate/promulgate.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thumbWidth: 400,//压缩宽度
    thumbHeight: 0,//压缩高度
    current: 0,//照片当前指标数
    showDel:false,//是否显示删除
    photo:[],
    msg:'',
    disabled: false,//防止多次提交
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //获取输入内容
  bindInput(e){
    this.setData({msg:e.detail.value});
  },
  //点击添加图片
  pushPhoto() {
    var that = this, max = 9;
    max -= that.data.photo.length;
    wx.chooseImage({
      count: max,
      sizeType: ['compressed'],
      success: function (res) {
        console.log({ '选择图片的返回数据': res });
        var tempFilePaths = res.tempFilePaths;
        that.recursionImg(0, tempFilePaths.length - 1, tempFilePaths);
      },
    })
  },
  //递归压缩多张图片
  recursionImg: function (curr, cnt, tempFilePaths) {
    var that = this;
    wx.showLoading({ title: '上传中' });
    this.compress(tempFilePaths[curr], 450, 750, function (res) {
      console.log(curr);
      that.setData({
        photo: that.data.photo.concat(res.tempFilePath)
      }, function () {
        if (curr < cnt) {
          that.recursionImg(++curr, cnt, tempFilePaths);
        } else {
          wx.hideLoading();
        }
      });
    });
  },
  // 压缩图片
  compress(file, maxWidth, maxHeight, callback) {
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
        if (height > maxHeight && maxHeight) {
          //超出限制高度
          var ratio = that.data.thumbHeight / res.height;//计算比例
          width = (maxHeight / height) * width.toFixed(2);
          height = maxHeight.toFixed(2);
        }
        //设置比例压缩的高宽
        that.setData({ thumbWidth: width, thumbHeight: height });
        //延迟绘画
        setTimeout(function () {
          var ctx = wx.createCanvasContext('firstCanvas');
          ctx.drawImage(file, 0, 0, width, height);
          ctx.draw(false, function () {
            //绘画完成回调,生成图片
            wx.canvasToTempFilePath({
              canvasId: 'firstCanvas',
              success: function (res) {
                typeof callback == "function" && callback(res);
              }, fail(res) {
                console.log('失败:')
                console.log(res);
              }
            })
          });
        }, 100)
      }
    })
  },
  //长按显示删除
  longTapShow(){
    this.setData({ showDel: !this.data.showDel});
  },
  //删除图片
  delPhoto(e) {
    console.log(e);
    var photo = this.data.photo;
    var index = e.currentTarget.dataset.index;
    photo.splice(index, 1);
    this.setData({
      photo: photo,
      current: 0,//不归0从前往后删除时会出现空白页
    });
  },
  //预览照片墙
  showPhoto(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.photo,
    })
  },
  //发布动态
  postDynamic:function(e){
    this.setData({ disabled: true });
    var that = this, data = e.detail.value;
    if (!data.content){
      app.warn('动态不能为空');
      this.setData({ disabled: false });
      return false;
    }
    //流程化接口
    wx.showLoading({ title: '提交中' });
    this.uploadPhoto().then(function (res) {
      data.photo_wall = res;//设置照片墙参数
      var url = app.d.hostUrl +'Dynamic/add';
      wx.hideLoading();
      app.http(url,data,'post',function(res){
        wx.hideLoading();
        wx.redirectTo({ 'url':'/pages/my/dynamic/dynamic'});
      })    
    }).catch(function (res) {
      wx.hideLoading();
    }) 
  },
  //上传照片墙
  uploadPhoto: function () {
    var photo_wall = [], that = this;
    var photo = this.data.photo;
    var photoCnt = photo.length;
    return new Promise(function (resolve, reject) {
      if (photoCnt){
        for (var i = 0; i < photoCnt; i++) {
          that.uploadImg(photo[i], function (res) {
            if (res.code == 200) {
              photo_wall.push(res.data);
              //上传到最后一张图片才终止
              if (photo_wall.length == photoCnt) {
                resolve(photo_wall);
              }
            } else {
              app.tishi(res.msg);
              reject('上传照片失败')
            }
          });
        }
      }else{
        resolve(photo_wall);
      }
     
    })
  },
  //上传图片文件
  uploadImg(file, callBack) {
    wx.uploadFile({
      url: app.d.hostUrl + 'Relevance/uploadImg',
      filePath: file,
      name: 'file',
      formData: { 'sessionid': app.globalData.loginInfo.sessionid },
      success(res) {
        var res = JSON.parse(res.data);
        typeof callBack == 'function' && callBack(res);
      }
    })
  },
  //取消发布
  cancel:function(){
    wx.navigateBack();
  }
})