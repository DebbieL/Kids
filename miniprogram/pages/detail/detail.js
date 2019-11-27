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
    families:[],
    category:'1'
  },

  editHandle: function () {
    wx.navigateTo({
      url: '../clue/clue?_id=' + this.data._id + '&lostclue=' + this.data.lostclue ,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var kid_id = options._id
    var cat = options.cat
    const that = this
    const db = wx.cloud.database()

    //获取孩子信息
    db.collection('kids').where({
      // _openid: app.globalData.openid,
      // _id: kid_id

      _openid: 'oy3xa5NygQNks2vtLLV7vLbzwiWk',
      _id: '73ecda94-8ee9-4721-8db4-db0441e1bbac'
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
             category: cat
             })
        }
      })

    //获取家庭关系
    db.collection('adults').where({
      // _openid: app.globalData.openid

      _openid: 'oy3xa5NygQNks2vtLLV7vLbzwiWk',
    })
      .get({
        success: function (res) {
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