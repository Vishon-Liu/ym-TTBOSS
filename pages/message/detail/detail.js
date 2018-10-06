// pages/message/detail/detail.js
let col1H = 0;
let col2H = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollH: 0,
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
  },

  onImageLoad: function (e) {
    console.log({'魔鬼':e});
    let imageId = e.currentTarget.id;
    let oImgW = e.detail.width;         //图片原始宽度
    let oImgH = e.detail.height;        //图片原始高度
    let imgWidth = this.data.imgWidth;  //图片设置的宽度
    let scale = imgWidth / oImgW;       //比例计算
    let imgHeight = oImgH * scale;      //自适应高度
    let images = this.data.images;
    let imageObj = null;

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img.id === imageId) {
        imageObj = img;
        break;
      }
    }

    imageObj.height = imgHeight;

    let loadingCount = this.data.loadingCount - 1;
    let col1 = this.data.col1;
    let col2 = this.data.col2;

    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(imageObj);
    } else {
      col2H += imgHeight;
      col2.push(imageObj);
    }

    let data = {
      loadingCount: loadingCount,
      col1: col1,
      col2: col2
    };

    if (!loadingCount) {
      data.images = [];
    }

    this.setData(data);
  },

  loadImages: function () {
    let images = [
      { id: 0, height: 0, img: 'http://f11.baidu.com/it/u=719139831,2246033258&fm=72' },
      { id: 1, height: 0, img: 'http://img4.imgtn.bdimg.com/it/u=4249246503,3141065561&fm=11&gp=0.jpg' },
      { id: 2, height: 0, img: 'http://img2.imgtn.bdimg.com/it/u=1223109412,647033122&fm=27&gp=0.jpg' },
      { id: 3, height: 0, img: 'http://img4.imgtn.bdimg.com/it/u=2470782786,1683926908&fm=27&gp=0.jpg' },
      { id: 4, height: 0, img: 'http://img2.imgtn.bdimg.com/it/u=1563309201,3922557567&fm=27&gp=0.jpg' },
      { id: 5, height: 0, img: 'http://img0.imgtn.bdimg.com/it/u=2057230170,2141935860&fm=27&gp=0.jpg' },
      { id: 6, height: 0, img: 'http://img2.imgtn.bdimg.com/it/u=699073474,2982786718&fm=27&gp=0.jpg' },
      { id: 7, height: 0, img: 'http://img3.imgtn.bdimg.com/it/u=2632216144,811862651&fm=27&gp=0.jpg' },
      { id: 8, height: 0, img: 'http://img0.imgtn.bdimg.com/it/u=2654089843,29884835&fm=26&gp=0.jpg' },
      { id: 9, height: 0, img: 'http://img3.imgtn.bdimg.com/it/u=1054654278,3762715981&fm=26&gp=0.jpg' },
      { id: 10, height: 0, img: 'http://img0.imgtn.bdimg.com/it/u=1652542152,496608834&fm=26&gp=0.jpg' },
      { id: 11, height: 0, img: 'http://img4.imgtn.bdimg.com/it/u=341757615,2406244729&fm=26&gp=0.jpg' },
      { id: 12, height: 0, img: 'http://a.hiphotos.baidu.com/baike/pic/item/562c11dfa9ec8a139b8d4b9ffe03918fa0ecc03e.jpg' },
      { id: 13, height: 0, img: 'http://img2.imgtn.bdimg.com/it/u=2924288851,433941127&fm=26&gp=0.jpg' },
      { id: 14, height: 0, img: 'http://img1.imgtn.bdimg.com/it/u=2131168962,676329409&fm=26&gp=0.jpg' },
      { id: 15, height: 0, img: 'http://img3.imgtn.bdimg.com/it/u=3485778575,840024704&fm=11&gp=0.jpg' },
      { id: 16, height: 0, img: 'http://img2.imgtn.bdimg.com/it/u=4086623963,1635066061&fm=26&gp=0.jpg' },
      { id: 17, height: 0, img: 'http://img4.imgtn.bdimg.com/it/u=3821825896,2042206750&fm=26&gp=0.jpg' },
      { id: 18, height: 0, img: 'http://img4.imgtn.bdimg.com/it/u=760956803,1429751009&fm=26&gp=0.jpg' },
      { id: 19, height: 0, img: 'http://img0.imgtn.bdimg.com/it/u=1338034049,1603812949&fm=26&gp=0.jpg' },
    ];

    let baseId = "img-" + (+new Date());
    // console.log({ 'baseId': baseId})

    for (let i = 0; i < images.length; i++) {
      images[i].id = baseId + "-" + i;
    }

    this.setData({
      loadingCount: images.length,
      images: images
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;
        
        this.setData({
          scrollH: scrollH,
          imgWidth: imgWidth
        });

        this.loadImages();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})