const AWS     = require("aws-sdk");
const axios   = require("axios");
const cheerio = require("cheerio");
const moment  = require("moment");

AWS.config.region = "ap-northeast-1";
const bucketName = "kusa-store";
const s3bucket = new AWS.S3({ params: { Bucket: bucketName } });

const graphSelector = ".js-calendar-graph-svg rect";

exports.handler = (event, context) => {
  axios.get("https://github.com/izumin5210")
    .then(res => {
      const key = `${moment().format("YYYYMMDDThhmmssSSS")}.json`;
      const $ = cheerio.load(res.data);
      const body = $(graphSelector).map((_i, e) => {
        return { date: $(e).data("date"), count: $(e).data("count") };
      }).get();
      return s3bucket.upload({ Key: key, Body: body }).promise();
    })
    .then(() => {
      context.succeed("Successfully uploaded data to myBucket/myKey");
    })
    .catch(err => {
      context.fail(`Error fetching data: ${err}`);
    });
};
