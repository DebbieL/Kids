const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    otherskids: [],
    othersisLost: true
    //点中所查看孩子的记录_id
  },

  //跳转到详情页
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
    
  },

  onShow: function () {
    const that = this
    const db = wx.cloud.database()

    //获取其他孩子信息
    const _ = db.command
    db.collection('kids').where({
      _openid: _.neq(app.globalData.openid),
      isLost: true
    })
      .get({
        success: function (res) {
          const otherskids = []
          for (var i = 0; i < res.data.length; i++) {
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
          that.setData({ otherskids: otherskids })
          if (otherskids != []) {
            that.setData({ othersisLost: true })
          }
        }
      })
  }
})