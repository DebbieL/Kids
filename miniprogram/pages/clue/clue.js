Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputClue:'',
    isSave: false,
    _id:''
  },

  inputClueHandle: function (e) {
    this.setData({ inputClue: e.detail.value })
  },

  //保存输入的内容至数据库
  isSave: function() {
    if(this.data.inputClue == '') return
    const that = this
    const db = wx.cloud.database()

    db.collection('kids').doc(this.data._id).update({
      // data 传入需要局部更新的数据
      data: {
        lostClue: that.data.inputClue
      },
      success: function (res) {
        that.setData({ isSave: true })
      }
    })
  },

  //清空输入框
  clearAll: function () {
    this.setData({ inputClue: '' })
  },

  //保存成功，返回
  backHandle: function () {
    this.setData({ isSave: false })
    wx.switchTab({
      url: '../message/message',   //注意switchTab只能跳转到带有tab的页面，不能跳转到不带tab的页面
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _id = options._id
    var inputClue = options.lostclue
    this.setData({ 
      _id: _id,
      inputClue: inputClue
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