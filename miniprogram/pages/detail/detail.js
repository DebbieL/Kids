// pages/detail/detail.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    photo: '',
    name: '',
    gender: '',
    age:'',
    lostclue: '',
    contact: '',
    families:[],
    category:'2',
    lp64: '',
    takePhoto1: '/assets/tabs/takephoto.png',
    tp164: '',
    takePhoto2: '/assets/tabs/takephoto.png',
    tp264: '',
    isShowScore: false,
    score: 0,
    status: '',
    anyScore: 0,
    count: 0
  },

  editHandle: function () {
    wx.navigateTo({
      url: '../clue/clue?_id=' + this.data._id + '&lostclue=' + this.data.lostclue ,
    })
  },

  takePhoto1: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0]
        var imgbase = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        that.setData({ takePhoto1: tempFilePaths, tp164: imgbase, isShowScore: true })
      }
    })
  },

  takePhoto2: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0]
        var imgbase = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        that.setData({ takePhoto2: tempFilePaths, tp264: imgbase })
      }
    })
  },

  againHandle1: function () {
    this.setData({ score: 0 })
  },

  againHandle2: function () {
    this.setData({ status: '', count: 0 })
  },

  faceAIHandle1:function () {
    //调用云函数，传两个值，两张照片的base64
    const that = this

    wx.cloud.downloadFile({
      fileID: that.data.photo,
      success: res => {
        const lp64 = wx.getFileSystemManager().readFileSync(res.tempFilePath, "base64")
        wx.cloud.callFunction({
          name: 'face',
          data: {
            image1: lp64,
            image2: that.data.tp164
          }
        })
          .then((res) => {
            console.log(res.result.facea.Score.toFixed(3))
            const score = res.result.facea.Score.toFixed(3)
            that.setData({ score: score })
          })
      },
      fail: err => {
        // handle error
      }
    })
    
  },

  faceAIHandle2: function () {
    //调用云函数，传两个值，两张照片的base64
    const that = this
    const families = that.data.families
    

    
    for (var i = 0; i < families.length; i++){

      const photobase64 = ''
      const status = families[i].relation
      
      wx.cloud.downloadFile({
        fileID: families[i].photo, 
        success: res => {
          photobase64 = wx.getFileSystemManager().readFileSync(res.tempFilePath, "base64")
          wx.cloud.callFunction({
            name: 'face',
            data: {
              image1: that.data.tp264,
              image2: photobase64
            }
          })
            .then((res) => {
              console.log(res.result.facea.Score.toFixed(3))
              const score = res.result.facea.Score.toFixed(3)
              if (score >= 70) {
                that.setData({ status: status, anyScore: score})
              }
              else{
                const count = that.data.count +1
                that.setData({ count: count })
              }
            })
        },
        fail: console.error
      })
    } 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var kid_id = options._id
    var kid_openid = options._openid
    var cat = options.cat
    const that = this
    const db = wx.cloud.database()

    //获取孩子信息
    db.collection('kids').where({
      _openid: kid_openid,
      _id: kid_id
    })
      .get({
        success: function (res) {
          that.setData({
            _id: kid_id,
             photo: res.data[0].kid_photo,
             name: res.data[0].kid_name,
             gender: res.data[0].kid_gender,
             age: res.data[0].kid_age,
             lostclue: res.data[0].lostClue,
             contact: res.data[0].contact,
             category: cat,
             })
        }
      })

    //获取家庭关系
    console.log(kid_openid)
    db.collection('adults').where({
      _openid: kid_openid
    })
      .get({
        success: function (res) {
          console.log(res.data)
          const families = []
          for (var i = 0; i < res.data.length; i++) {
            families.push({
              photo: res.data[i].photo,
              relation: res.data[i].relation
            })
          }
          that.setData({ families: families })
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})