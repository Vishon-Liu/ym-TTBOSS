// pages/personal/personal.js
var temporary = [];
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    serverName:'',
    loginInfo:'',
    thumbWidth: 250,//压缩宽度
    thumbHeight: 0,//压缩高度
    avatarImg: [],//头像
    bannerImg: [],//照片墙数组
    current: 0,//照片墙当前指标数
    disabled: false,//防止多次提交
    tmpAvatar:[],//临时头像
    tmpBanners:[],//临时照片墙
    showWidth: '',//图片显示宽度,做自适应显示用
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
    var that = this;
    var loginInfo = app.globalData.loginInfo;
    this.setData({
      loginInfo: loginInfo,
      avatarImg: [loginInfo.photo],
      bannerImg: loginInfo.info.photo_wall,
      serverName:app.d.serverName,
    })
    // wx.getSystemInfo({
    //   success: function (info) {
    //     console.log(info.windowWidth * 0.86)
    //     that.setData({ 'showWidth': info.windowWidth * 0.86 });
    //   }
    // })
  },
  //修改个人信息
  editInfo: function (e) {
    this.setData({ disabled: true });
    var required = {
      'nickname': '昵称', 'mail': '邮箱', 'tel': '手机号',
      'wechat': '微信号', 'welcome_speech': '欢迎语', 'job_title': '职业名称',
      'intro': '简介'
    };
    var that = this, data = e.detail.value;
    var bannersCnt = this.data.bannerImg.length + this.data.tmpBanners.length;
    if (!bannersCnt) {
      app.warn('照片墙不能为空');
      this.setData({ disabled: false });
      return false;
    }
    for (var i in data) {
      if (!data[i]) {
        if (required[i]) {
          app.warn('必选项不能为空');
          this.setData({ [i]: true });
          this.setData({ disabled: false });
          return false;
        }
      }
    }
    //流程化接口
    wx.showLoading({ title: '提交中' });
    this.uploadAvatar().then(function (res) {
      //设置头像参数
      data.photo = res; 
      return that.uploadPhoto();
    }).then(function (res) {
      //设置照片墙参数
      data.photo_wall = res;
      wx.hideLoading();
      //调用编辑接口
      var url = app.d.hostUrl + 'User/editInfo';
      app.http(url,data,'post',function(newData){ 
        //更新缓存
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            var loginInfo = res.data;
            for (var i in newData){
              if(i!='photo'){
                loginInfo[i] = newData[i];
              }else{
                loginInfo[i] = that.data.serverName+newData[i];
              }    
            }  
            app.globalData.loginInfo=loginInfo;
            wx.setStorage({
              key: 'loginInfo',
              data: loginInfo ,
              success:function(){
                app.tishi('更新成功',function(){
                  wx.switchTab({ url: '/pages/my/my' });
                }) 
              }
            });
          }
        })
      },function(){
        app.tishi('更新成功', function () {
          wx.switchTab({ url: '/pages/my/my' });
        })
      })
    }).catch(function (res) {
      wx.hideLoading();
    })
  },
  //上传头像
  uploadAvatar: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (that.data.tmpAvatar.length) {
        that.uploadImg(that.data.tmpAvatar[0], function (res) {
          if (res.code == 200) {
            resolve(res.data);
          } else {
            app.tishi(res.msg);
            reject('上传头像失败');
          }
        })
      }else{
        var img=that.data.avatarImg[0].replace(that.data.serverName,'');
        resolve(img);
      }   
    })
  },
  //上传照片墙
  uploadPhoto: function () {
    var photo_wall = this.data.bannerImg, that = this;
    var tmpBanners = this.data.tmpBanners;
    var tmpBannersCnt = tmpBanners.length;
    var tmp=[];
    return new Promise(function (resolve, reject) {
      if (tmpBannersCnt){
        for (var i = 0; i < tmpBannersCnt; i++) {
          that.uploadImg(tmpBanners[i], function (res) {
            if (res.code == 200) {
              photo_wall.push(res.data);
              tmp.push(res.data);
              //上传到最后一张图片才终止
              if (tmp.length == tmpBannersCnt) {
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
      formData: { 'sessionid': this.data.loginInfo.sessionid },
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
        that.compress(tempFilePaths[0], '200', false, function (res) {
          var arr = [res.tempFilePath];
          that.setData({ tmpAvatar: arr });
        });
      },
    })
  },
  // 添加图片
  addPhoto() {
    var max = 5;//最多上传5张
    max -= this.data.bannerImg.length + this.data.tmpBanners.length;
    if (!max) {
      app.warn('图片最多5张');
      return false;
    }
    var that = this;
    wx.chooseImage({
      count: max,
      sizeType: ['compressed'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        that.recursionImg(0, tempFilePaths.length - 1, tempFilePaths);
      },
    })
  },
  //递归压缩图片
  recursionImg: function (curr, cnt, tempFilePaths) {
    var that = this;
    wx.showLoading({ title: '上传中' });
    this.compress(tempFilePaths[curr], 450, false, function (res) {
      that.setData({
        tmpBanners: that.data.tmpBanners.concat(res.tempFilePath)
      }, function () {
        if (curr < cnt) {
          that.recursionImg(++curr, cnt, tempFilePaths);
        } else {
          wx.hideLoading();
        }
      });
    });
  },
  //删除图片
  delPhoto(e) {
    var imgType = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    if(imgType=='tmp'){
      var list = this.data.tmpBanners;
      list.splice(index, 1);
      this.setData({
        tmpBanners: list,
        current: 0,//不归0从前往后删除时会出现空白页
      });
    }else{
      var list = this.data.bannerImg;
      list.splice(index, 1);
      this.setData({
        bannerImg: list,
        current: 0,//不归0从前往后删除时会出现空白页
      });
    }
  },
  // 压缩图片
  //file图片文件(必选)
  //maxWidth限制宽度(必选)
  //maxHeight限制高度(可选)
  //callback压缩完成回调方法(可选)
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
        if (res.height > maxHeight && maxHeight) {
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
  //预览头像图片
  showAvatar(e) {
    if (e.currentTarget.dataset.type=='tmp'){
      var img = this.data.tmpAvatar;
    }else{
      var img = this.data.avatarImg;
    }
    wx.previewImage({
      urls: img,
    })
  },
  //预览照片墙
  showPhoto(e) {
    var src = e.currentTarget.dataset.src;
    var list=[];
    for(var i in this.data.bannerImg){
      var img = this.data.serverName + this.data.bannerImg[i];
      list.push(img);
    }
    for (var i in this.data.tmpBanners){
      list.push(this.data.tmpBanners[i]);
    }
    wx.previewImage({
      current: src,
      urls: list,
    })
  },
  //自适应照片高宽
  bannersAdapt: function (e) {
    var data = e.detail;
    var index = e.target.dataset.index;
    var list = this.data.bannerImg;
    var ratio = this.data.showWidth / data.width;
    list[index]['width'] = this.data.showWidth;
    list[index]['height'] = data.height * ratio;
    this.setData({ bannerImg: list });
  },
  //监听轮播图变更
  bannerChange: function (e) {
    this.setData({ current: e.detail.current });
  }
})