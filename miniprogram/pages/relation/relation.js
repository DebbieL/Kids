// pages/relation/relation.js
var amapFile = require('../../libs/amap-wx.js');
var markersData = {
  latitude: '',//纬度
  longitude: '',//经度
  key: "9932feb0dbd3ac4d28cd35d1a212acf0"//申请的高德地图key
};

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //存放孩子
    kids: [],
    photoPath: '/assets/tabs/avatar.png',//临时路径
    inputName: '',
    inputGender: '',
    inputAge: '',
    isLost: false,
    address:'',
    isDeleteChild: false,
    isDeleteAdult: false,
    families:[],
    inputRelation: '',
    isPlusChild: false,
    isPlusAdult: false,
    changeStatus: false,
    _index: '',//界面中孩子列的序号
    _id:''
  },

   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
  loadCity: function (latitude, longitude) {
    var that = this
    var myAmapFun = new amapFile.AMapWX({ key: markersData.key })
    myAmapFun.getRegeo({
      location: '' + longitude + ',' + latitude + '',//location的格式为'经度,纬度'
      success: function (data) {
        console.log(data);
        const currentLocation = data[0].desc
        that.setData({ address: currentLocation })
      },
      fail: function (info) { }
    })
  },

  //获取当前位置的经纬度
  loadInfo: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude//维度
        var longitude = res.longitude//经度
        console.log(res);
        that.loadCity(latitude, longitude);
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
        const tempFilePaths = res.tempFilePaths[0]
        that.setData({ photoPath: tempFilePaths })
      }
    })
  },

  back1Handle: function () {
    this.setData({ isPlusChild: false })
  },

  back2Handle: function () {
    this.setData({ isPlusAdult: false })
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
    //将照片上传到云存储

    const that = this

    const filePath = this.data.photoPath
    const name = Math.random() * 1000000
    const cloudPath = name + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath, //云存储图片名字
      filePath, //临时路径
      success: res => {
        const db = wx.cloud.database()
        db.collection('kids').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            kid_photo: res.fileID,
            kid_name: that.data.inputName,
            kid_gender: that.data.inputGender,
            kid_age: that.data.inputAge,
            isLost: false,
            address: that.data.address,
            lostClue: ''
          },
          success: function (res) {

            that.setData({
              isPlusChild: false,
              photoPath: '/assets/tabs/avatar.png',
              inputName: '',
              inputGender: '',
              inputAge: ''
            })
            that.onLoad()
          }
        })
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

    const that = this

    const filePath = this.data.photoPath
    const name = Math.random() * 1000000
    const cloudPath = name + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath, //云存储图片名字
      filePath, //临时路径
      success: res => {
        const db = wx.cloud.database()
        db.collection('adults').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            photo: res.fileID,
            relation: that.data.inputRelation,
          },
          success: function (res) {
            that.setData({
              isPlusAdult: false,
              photoPath: '/assets/tabs/avatar.png',
              inputRelation: ''
            })
            that.onLoad()
          }
        })
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

  //删除孩子
  isDeleteChildHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var _id = this.data.kids[index]._id
    this.setData({ isDeleteChild: true, _id: _id })
  },

  deleteChildHandle: function () {
    const that = this
    const db = wx.cloud.database()
    db.collection('kids').doc(that.data._id).remove({
      success: function (res) {
        that.setData({ isDeleteChild: false })
        that.onLoad()
      }
    })
  },

  notDeleteChildHandle: function () {
    this.setData({ isDeleteChild: false })
  },

  //删除亲属
  isDeleteAdultHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var _id = this.data.families[index]._id
    this.setData({ isDeleteAdult: true, _id: _id })
  },

  deleteAdultHandle: function () {
    const that = this
    const db = wx.cloud.database()
    db.collection('adults').doc(that.data._id).remove({
      success: function (res) {    
        that.setData({ isDeleteAdult: false })
        that.onLoad()
      }
    })
  },

  notDeleteAdultHandle: function () {
    this.setData({ isDeleteAdult: false })
  },



  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadInfo()
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
              relation: res.data[i].relation,
              _id: res.data[i]._id
            })
          }
          that.setData({ families: families })
        }
      })
  }
})