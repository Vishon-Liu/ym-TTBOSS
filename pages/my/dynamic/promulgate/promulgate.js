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
  },

  //发布
  // promulgate(){
  //   console.log({'msg':this.data.msg,'photo':this.data.photo});
  //   var that = this;
  //   var url = app.d.hostUrl + 'Dynamic/add';
  //   var data = { 'content': that.data.msg, 'photo_wall':that.data.photo};
  //   if (this.data.msg){
  //     app.http(url, data, 'post', function (res) {
  //       wx.navigateTo({
  //         url: '../dynamic',
  //       })
  //     });
  //     // return console.log('ojbk');
  //   }else{
  //     app.warn('写点想法吧');
  //   }
  // },
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
        that.compress(0, 0, res.tempFilePaths);
      },
    })
  },
  //压缩图片
  compress(index, failNum, tempFilePaths){
    var that = this;
    console.log({ 'tempFilePaths': tempFilePaths});
    if (index < tempFilePaths.length){
      wx.getImageInfo({
        src: tempFilePaths[index],
        success:function(res){
          console.log({ 'res': res });
          var ratio = that.data.thumbWidth / res.width;     //ratio保存图片比例
          console.log({ 'width': res.width, 'height': res.height, "ratio": ratio })
          if (res.width > that.data.thumbWidth) {     //判断,如果原图的宽>所需图片宽度
            that.setData({ thumbHeight: res.height * ratio }); //修改图片的高度
          } else {                                                  //否则
            that.setData({ thumbHeight: res.height, thumbWidth: res.width });
          }
          console.log({ 'width': that.data.thumbWidth, 'height': that.data.thumbHeight })
        }
      })
      //按比例压缩图片
      const ctx = wx.createCanvasContext('firstCanvas');
      ctx.drawImage(tempFilePaths[index], 0, 0, that.data.thumbWidth, that.data.thumbHeight);
      ctx.draw(false, function () {
        index = index + 1;//上传成功的数量，上传成功则加1
        wx.canvasToTempFilePath({
          canvasId: 'firstCanvas',
          success: function success(res) {
            console.log({ 'resssss': res });
            // typeof callback == "function" && callback(res);
            that.setData({
              photo: that.data.photo.concat(res.tempFilePath)
            });
            that.compress(index, failNum, tempFilePaths);
          }
        });
      });
    };
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
  showPhoto() {
    console.log(this.data.photo);
    wx.previewImage({
      urls: this.data.photo,
      current: 0
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  }
})