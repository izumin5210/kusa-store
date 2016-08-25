var aws     = require('aws-sdk');
var axios   = require('axios');
var cheerio = require('cheerio');
var moment  = require('moment');

aws.config.region = 'ap-northeast-1';
var bucketName = 'kusa-store';
var s3bucket = new aws.S3({ params: { Bucket: bucketName }});

exports.handler = function(event, context) {
  axios.get('https://github.com/izumin5210')
    .then(function (res) {
      var key = moment().format('YYYYMMDDThhmmssSSS') + ".json";
      var $ = cheerio.load(res.data);
      var body =
        $('.js-calendar-graph-svg rect').map(function(_i, el) {
          return { date: $(el).data('date'), count: $(el).data('count') };
        }).get();
      s3bucket.upload({ Key: key, Body: body }, function(err, data) {
        if (err) {
          context.fail('Error uploading data: ', err);
        } else {
          context.succeed('Successfully uploaded data to myBucket/myKey');
        }
      });
    })
  .catch(function (err) {
    context.fail('Error fetching data: ', err);
  });
};
