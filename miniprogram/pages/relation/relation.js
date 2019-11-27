// pages/relation/relation.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //存放孩子
    kids: [],
    photoPath: '/assets/tabs/avatar.png',
    inputName: '',
    inputGender: '',
    inputAge: '',
    isLost: false,
    families:[],
    inputRelation: '',
    isPlusChild: false,
    isPlusAdult: false,
    changeStatus: false,
    _index: '',//界面中孩子列的序号
    _id:''
  },


  //获取openid
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
        console.log(app.globalData.openid)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  isPlusChild: function () {
    this.setData({isPlusChild: true})
  },

  isPlusAdult: function () {
    this.setData({isPlusAdult: true})
  },

  //添加孩子，添加照片
  addPhotoHandle: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        that.setData({ photoPath: tempFilePaths })
      }
    })

  },

  inputNameHandle: function (e) {
    this.setData({ inputName: e.detail.value })
  },

  inputGenderHandle: function (e) {
    this.setData({ inputGender: e.detail.value })
  },

  inputAgeHandle: function (e) {
    this.setData({ inputAge: e.detail.value })
  },

//增加孩子
  addChildHandle: function () {
    if (this.data.photoPath == '/assets/tabs/avatar.png' || !this.data.inputName || !this.data.inputGender || !this.data.inputAge) return
    const db = wx.cloud.database() 
    const that = this
    db.collection('kids').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        kid_photo: that.data.photoPath,
        kid_name: that.data.inputName,
        kid_gender: that.data.inputGender,
        kid_age: that.data.inputAge,
        isLost: false,
        address: '',
      },
      success: function (res) {
        that.setData({ isPlusChild: false, photoPath: '/assets/tabs/avatar.png'})
        that.onLoad()
      }
    })
  },

  clearAllHandle: function () {
    this.setData({
      photoPath: '/assets/tabs/avatar.png',
      inputName: '',
      inputGender: '',
      inputAge: '',
      inputRelation: ''
    })
  },

  inputRelationHandle: function (e) {
    this.setData({ inputRelation: e.detail.value })
  },

//增加主要家庭成员
  addAdultHandle: function () {
    if (this.data.photoPath == '/assets/tabs/avatar.png' || !this.data.inputRelation) return
    const db = wx.cloud.database()
    const that = this
    db.collection('adults').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        photo: that.data.photoPath,
        relation: that.data.inputRelation,
      },
      success: function (res) {
        that.setData({ isPlusAdult: false, photoPath: '/assets/tabs/avatar.png' })
        that.onLoad()
      }
    })
  },



  //修改孩子状态
  changeStatus: function (e) {
    var isLost = this.data.kids[e.currentTarget.dataset.index].isLost
    var index = e.currentTarget.dataset.index
    var _id = this.data.kids[e.currentTarget.dataset.index]._id
    this.setData({ isLost: isLost, changeStatus: true, _index: index, _id: _id })
  },

  //孩子没有失踪，并且不修改为失踪 && 孩子失踪，并且保持失踪状态
  notChange: function () {
    this.setData({ changeStatus: false })
  },

  //孩子没有失踪，更改为失踪 && 孩子失踪，更改为正常状态
  change: function () {
    var _id = this.data.kids[this.data._index]._id
    console.log(_id)
    var _isLost = !this.data.kids[this.data._index].isLost
    console.log(_isLost)
    const that = this
    const db = wx.cloud.database()

    db.collection('kids').doc(_id).update({
      // data 传入需要局部更新的数据
      data: {
        isLost: _isLost,
        lostClue: ''
      },
      success: function (res) {
        that.setData({ changeStatus: false })
        that.onLoad()
        console.log('成功')
      }
    })
  },

  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetOpenid()
    const that = this
    const db = wx.cloud.database()

    //获取孩子信息
    db.collection('kids').where({
      _openid: app.globalData.openid
    })
      .get({
        success: function (res) {
          const kids = []
          for(var i=0;i<res.data.length;i++){
            kids.push({
              _id: res.data[i]._id,
              photo: res.data[i].kid_photo,
              name: res.data[i].kid_name,
              gender: res.data[i].kid_gender,
              age: res.data[i].kid_age,
              isLost:res.data[i].isLost
            })
          }
          that.setData({ kids: kids }) 
        }
      })

    //获取家庭关系
    db.collection('adults').where({
      _openid: app.globalData.openid
    })
      .get({
        success: function (res) {
          const families = []
          for(var i=0;i<res.data.length;i++){
            families.push({
              photo: res.data[i].photo,
              relation: res.data[i].relation
            })
          }
          that.setData({ families: families })
        }
      })
  }
})