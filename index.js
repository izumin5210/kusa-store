const AWS     = require("aws-sdk");
const axios   = require("axios");
const cheerio = require("cheerio");
const moment  = require("moment");

AWS.config.region = "ap-northeast-1";
const bucketName = "kusa-store";
const s3bucket = new AWS.S3({ params: { Bucket: bucketName } });

const graphSelector = ".js-calendar-graph-svg rect";

const githubUsername = "izumin5210";

const uploadToS3 = body => {
  const key = `${moment().format("YYYYMMDDThhmmssSSS")}.json`;
  return s3bucket.putObject({ Key: key, Body: JSON.stringify(body) }).promise();
};

const fetchKusa = username => {
  return axios.get(`https://github.com/${username}`)
    .then(res => {
      const $ = cheerio.load(res.data);
      const body = $(graphSelector).map((_i, e) => {
        return { date: $(e).data("date"), count: $(e).data("count") };
      }).get();
      return Promise.resolve(body);
    });
};

exports.handler = (event, context) => {
  fetchKusa(githubUsername)
    .then(uploadToS3)
    .then(() => {
      context.succeed("Successfully uploaded data to myBucket/myKey");
    })
    .catch(err => {
      context.fail(`Error fetching data: ${err}`);
    });
};
