var mongo = require("mongodb");
var mongoose = require("mongoose");
const { Schema } = mongoose;
var URL = require("url").URL;

const dns = require("dns");

module.exports = (req, res) => {
  const urlDataSchema = new Schema({
    urlLong: { type: String, unique: true },
    urlShort: Number,
  });
  const UrlData = mongoose.model("UrlData", urlDataSchema);
  // Regex
  const reg1 = /^https:\/\//;
  const reg2 = /^http:\/\//;
  const reg3 = /\/$/;

  app.post("/api/shorturl/new", (req, res) => {
    console.log(req);
    console.log(req.body.url);
    var postedURL = req.body.url;
    // replace problem characters

    if (!stringIsAValidUrl(postedURL)) {
      res.json({
        error: "invalid url",
      });
    } else if (
      new URL(postedURL).protocol != "http:" &&
      new URL(postedURL).protocol != "https:"
    ) {
      res.json({
        error: "invalid url",
      });
    }
    // Checks if posted URL exists alreadyin db
    // possible break point needs testing
    else {
      UrlData.estimatedDocumentCount((err, count) => {
        if (err) return console.error(err);
        var docNum = count + 1;
        UrlData.find({ urlLong: postedURL }, (err, returnedData) => {
          if (err) return console.error(err);
          if (returnedData.length) {
            console.log(returnedData);
            res.json({
              original_url: returnedData[0].urlLong,
              short_url: returnedData[0].urlShort,
            });
          } // New entry
          else {
            var newEntry = new UrlData({
              urlLong: postedURL,
              urlShort: docNum,
            });
            newEntry.save((err, data) => {
              if (err) return console.error(err);
              res.json({
                original_url: data.urlLong,
                short_url: data.urlShort,
              });
            });
          }
        });
      });
    }
  });
};
