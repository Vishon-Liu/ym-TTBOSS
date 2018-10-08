// pages/personal/personal.js
var temporary = []; 
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    thumbWidth: 250,//压缩宽度
    thumbHeight: 0,//压缩高度
    avatarImg:[],//头像
    bannerImg: [],//照片墙数组
    current:0,//照片墙当前指标数
    sessionid:'',
    disabled:false,//防止多次提交
    //聚焦监听 
    'nickname': false, 
    'mail': false, 
    'tel': false, 
    'wechat': false, 
    'welcome_speech': false, 
    'job_title': false, 
    'intro': false 
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({sessionid:options.sessionid});
  },
  //关联公司
  relevanceCompany:function(e){
    this.setData({ disabled:true});
    var required = { 'nickname':'昵称','mail': '邮箱', 'tel': '手机号',
     'wechat':'微信号','welcome_speech': '欢迎语', 'job_title':'职业名称',
     'intro':'简介'};  
    var that =this,data=e.detail.value;
    //检验不能为空的参数
    if (!this.data.avatarImg.length) {
      app.warn('头像不能为空');
      this.setData({ disabled: false });
      return false;
    }
    if (!this.data.bannerImg.length) {
      app.warn('照片墙不能为空');
      this.setData({ disabled: false });
      return false;
    }
    for(var i in data){
      if(!data[i]){
        if (required[i]){
          app.warn('必选项不能为空');
          this.setData({[i]:true});
          this.setData({ disabled: false });
          return false;
        }
      }
    }
    //流程化接口
    wx.showLoading({ title: '提交中' });
    this.uploadAvatar().then(function(res){    
      data.photo = res; //设置头像参数
      return that.uploadPhoto();
    }).then(function(res){
      data.photo_wall = res;//设置照片墙参数
      data.sessionid =that.data.sessionid;//设置关联凭证
      //调用关联凭证
      return that.relevance(data);
    }).then(function(res){
      wx.hideLoading();
      if (res.code == 200) {
        app.globalData.sessionid=res.data;
        app.tishi(res.msg, function (res) {
          wx.switchTab({ url: '/pages/index/index'})
        });
      } else {
        app.tishi(res.msg, function (res) {
          wx.redirectTo({ url: '/pages/default/default' })
        });
      }  
    }).catch(function (res) {
      wx.hideLoading();
    }) 
  }, 
  //调用关联接口
  relevance:function(data){
    var that=this;
    return new Promise(function (resolve, reject){
      wx.request({
        url: app.d.hostUrl + 'Relevance/relevanceCompany',
        method: 'post',
        data: data,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          resolve(res.data);
        }
      })
    })
  },
  //上传头像
  uploadAvatar: function () {
    var that=this;
    return new Promise(function (resolve, reject) {
      that.uploadImg(that.data.avatarImg[0],function(res){
        if (res.code == 200) {
          resolve(res.data);
        } else {
          app.tishi(res.msg);
          reject('上传头像失败');
        }
      })
    })
  },
  //上传照片墙
  uploadPhoto:function(){
    var photo_wall = [],that=this;
    var banners = this.data.bannerImg;
    var bannersCnt = banners.length; 
    return new Promise(function (resolve, reject) {
      for (var i = 0; i < bannersCnt; i++) {
        that.uploadImg(banners[i], function (res) {
          if (res.code == 200) {
            photo_wall.push(res.data);
            //上传到最后一张图片才终止
            if (photo_wall.length==bannersCnt){
              resolve(photo_wall);
            }
          } else {
            app.tishi(res.msg);
            reject('上传照片失败')
          }
        });
      }
    })
  },
  //上传图片文件
  uploadImg(file,callBack){
    wx.uploadFile({
      url: app.d.hostUrl + 'Relevance/uploadImg',
      filePath: file,
      name: 'file',
      formData: { 'sessionid': this.data.sessionid },
      success(res) {
        var res = JSON.parse(res.data);
        typeof callBack == 'function' && callBack(res);
      }
    })
  },
  // 添加头像
  addAvatar() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        that.compress(tempFilePaths[0],'200',false, function (res) {
          var arr=[];
          arr.push(res.tempFilePath)
          that.setData({ avatarImg:  arr});
        });
      },
    })
  },
  // 添加图片
  addPhoto() {
    var max=5;//最多上传5张
    max -= this.data.bannerImg.length;
    if(!max){
      app.warn('图片最多5张');
      return false;
    }
    var that = this;
    wx.chooseImage({
      count: max,
      sizeType: ['compressed'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        for (var i = 0; i < tempFilePaths.length; i++) {
          that.compress(tempFilePaths[i],'450',false, function (res) {
            that.setData({
              bannerImg: that.data.bannerImg.concat(res.tempFilePath)
            });
          });
        }
      },
    })
  },
  //删除图片
  delPhoto(e) {
    var photo = this.data.bannerImg;
    var index = e.currentTarget.dataset.index;
    photo.splice(index, 1);
    this.setData({
      bannerImg: photo,
      current:0,//不归0从前往后删除时会出现空白页
    }); 
  },
  // 压缩图片
  //file图片文件(必选)
  //maxWidth限制宽度(必选)
  //maxHeight限制高度(可选)
  //callback压缩完成回调方法(可选)
  compress(file,maxWidth,maxHeight,callback) {    //接收传过来的图片
    var that=this;
    //获取原图片信息
    wx.getImageInfo({
      src: file,
      success: function (res) {
        var width=res.width,height=res.height;
        if(width>maxWidth){
          //超出限制宽度
          height = (maxWidth / width) * height;
          width = parseInt(maxWidth); 
        }
        if(res.height>maxHeight&&maxHeight){
          //超出限制高度
          var ratio = that.data.thumbHeight / res.height;//计算比例
          width = (maxHeight / height) * width.toFixed(2);
          height = maxHeight.toFixed(2);
        }
       
        that.setData({ thumbWidth:width,thumbHeight: height });
        
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
  //预览头像图片
  showAvatar() {
    wx.previewImage({
      urls: this.data.avatarImg,
    })
  },
  //预览照片墙
  showPhoto() {
    wx.previewImage({
      urls: this.data.bannerImg,
    })
  },
})