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
    category:'2',
    localPhoto: '/assets/tabs/takephoto.png',
    lp64: '',
    takePhoto1: '/assets/tabs/takephoto.png',
    tp164: '',
    takePhoto2: '/assets/tabs/takephoto.png',
    tp264: '',
    isShowScore: false,
    score: 0,
  },

  editHandle: function () {
    wx.navigateTo({
      url: '../clue/clue?_id=' + this.data._id + '&lostclue=' + this.data.lostclue ,
    })
  },



  uploadPhoto: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0]
        var imgbase = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        that.setData({ localPhoto: tempFilePaths, lp64: imgbase })
      }
    })
  },

  takePhoto1: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
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
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0]
        var imgbase = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        that.setData({ takePhoto2: tempFilePaths, tp264: imgbase })
      }
    })
  },

  faceAIHandle:function () {
    const tencentcloud = require("../../tencentcloud-sdk-nodejs-3.0.102");


    const IaiClient = tencentcloud.iai.v20180301.Client;
    const models = tencentcloud.iai.v20180301.Models;

    const Credential = tencentcloud.common.Credential;
    const ClientProfile = tencentcloud.common.ClientProfile;
    const HttpProfile = tencentcloud.common.HttpProfile;

    let cred = new Credential("AKIDQrGbCgBJXdcDKKsxgN0czX4XxKcru3Rs", "eGqTckLn8MXfgcQCxfMymZMVdkdVfFoM");
    let httpProfile = new HttpProfile();
    httpProfile.endpoint = "iai.tencentcloudapi.com";
    let clientProfile = new ClientProfile();
    clientProfile.httpProfile = httpProfile;
    let client = new IaiClient(cred, "", clientProfile);

    let req = new models.CompareFaceRequest();

    let params = '{"ImageA":"' + this.data.lp64 + '","ImageB":"' + this.data.tp164 + '"}'
    req.from_json_string(params);


    client.CompareFace(req, function (errMsg, response) {

      if (errMsg) {
        console.log(errMsg);
        return;
      }

      console.log(response.to_json_string());
    });
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
             category: cat
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