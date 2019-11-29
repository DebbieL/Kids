// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  traceUser: true,
  env: 'lei-wx2019-cbbjg'
})

const tencentcloud = require("tencentcloud-sdk-nodejs-signature3");

const IaiClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let cred = new Credential("AKIDQrGbCgBJXdcDKKsxgN0czX4XxKcru3Rs", "eGqTckLn8MXfgcQCxfMymZMVdkdVfFoM");
let httpProfile = new HttpProfile();
httpProfile.endpoint = "iai.tencentcloudapi.com";
let clientProfile = new ClientProfile();
clientProfile.signMethod = "TC3-HMAC-SHA256";
clientProfile.httpProfile = httpProfile;
let client = new IaiClient(cred, "ap-guangzhou", clientProfile);

let req = new models.CompareFaceRequest();


// 云函数入口函数
exports.main = async (event, context) => {
  let facea = await promise1()
  console.log(facea)
  return {
    facea
  }

  function promise1() {
    return new Promise((resolve, reject) => {
      let params = {
        ImageA: event.image1,
        ImageB: event.image2,
        FaceModelVersion: '3.0',
        QualityControl: '0'
      }

      req.from_json_string(JSON.stringify(params));

      client.CompareFace(req, function (errMsg, response) {

        if (errMsg) {
          console.log(errMsg);
          reject(errMsg)
        }

        console.log(response);
        resolve(response)
      });

    })
  }
}