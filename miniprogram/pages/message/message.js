// pages/message/message.js
const app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var markersData = {
  latitude: '',//纬度
  longitude: '',//经度
  key: "9932feb0dbd3ac4d28cd35d1a212acf0"//申请的高德地图key
};


Page({

  /**
   * 页面的初始数据
   */
  data: {
    mykids: [],
    selfislost: false,
    otherskids: [],
    othersisLost:true,
    latitude: '',
    longitude: ''
    //点中所查看孩子的记录_id
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
        that.setData({ latitude: latitude, longitude: longitude })
        that.loadCity(latitude, longitude);
      }
    })
  },

  //距离函数
  getDistance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s
  },

  //跳转到详情页
  editHandle: function(e) {
    var choosedid = this.data.mykids[e.currentTarget.dataset.index]._id
    var openid = this.data.mykids[e.currentTarget.dataset.index]._openid
    wx.navigateTo({
      url: '../detail/detail?_id=' + choosedid + '&cat=1' + '&_openid=' + openid,
    })
  },

  viewHandle: function (e) {
    var choosedid = this.data.otherskids[e.currentTarget.dataset.index]._id
    var openid = this.data.otherskids[e.currentTarget.dataset.index]._openid
    wx.navigateTo({
      url: '../detail/detail?_id=' + choosedid + '&cat=2' + '&_openid=' + openid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadInfo()
    const dis = this.getDistance(114.356259, 30.533812, 110.901415, 32.59919)
    console.log('555555555 ' + dis)
  },

  onShow: function () {
    const that = this
    const db = wx.cloud.database()

    //获取自己孩子信息
    db.collection('kids').where({
      _openid: app.globalData.openid,
      isLost: true
    })
      .get({
        success: function (res) {
          const mykids = []
          for (var i = 0; i < res.data.length; i++) {
            mykids.push({
              photo: res.data[i].kid_photo,
              name: res.data[i].kid_name,
              _id: res.data[i]._id,
              _openid: res.data[i]._openid
            })
          }
          that.setData({ mykids: mykids })
          if (mykids != []) {
            that.setData({ selfislost: true })
          }
        }
      })
    //获取其他孩子信息
    const _ = db.command
    db.collection('kids').where({
      _openid: _.neq(app.globalData.openid),
      isLost: true
    })
      .get({
        success: function (res) {
          const otherskids = []
          const lat1 = that.data.latitude
          const lng1 = that.data.longitude
          console.log('11111111  ' + lat1 + ' ' + lng1)
          for (var i = 0; i < res.data.length; i++) {
            const lat2 = res.data[i].kid_latitude
            const lng2 = res.data[i].kid_longitude
            console.log('22222222  ' + lat2 + ' ' + lng2)
            const dis = that.getDistance(lat1, lng1, lat2, lng2)
            console.log(dis)
            if(dis <= 50){
              otherskids.push({
                photo: res.data[i].kid_photo,
                name: res.data[i].kid_name,
                gender: res.data[i].kid_gender,
                age: res.data[i].kid_age,
                address: res.data[i].address,
                _id: res.data[i]._id,
                _openid: res.data[i]._openid
              })
            }   
          }
          // console.log(otherskids)
          that.setData({ otherskids: otherskids })
          if (otherskids != []) {
            that.setData({ othersisLost: true })
          }
        }
      })
  }
})