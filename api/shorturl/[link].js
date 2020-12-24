import { connectToDb } from "../../lib/database.js";
var URL = require("url").URL;
var mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const reg1 = /^https:\/\//;
    const reg2 = /^http:\/\//;
    //const reg3 = /\/$/;
    const db = await connectToDb();
    const collection = await db.collection("urldatas");
    let short = parseInt(req.query.link);
    await collection
      .find({ urlShort: short })
      .toArray()
      .then((data) => {
        //console.log(data[0]);
        if (!data[0].urlLong) {
          res.json({ error: "No shortened URL found" });
        } else if (reg1.test(data[0].urlLong) || reg2.test(data[0].urlLong)) {
          res.redirect(data[0].urlLong);
        } else {
          res.redirect("https://" + data[0].urlLong);
        }
      });
  } else if (req.method === "POST") {
    const stringIsAValidUrl = (str) => {
      try {
        new URL(str);
        return true;
      } catch (err) {
        return false;
      }
    };
    const db = await connectToDb();
    const collection = await db.collection("urldatas");
    const urlDataSchema = new Schema({
      urlLong: { type: String, unique: true },
      urlShort: Number,
    });
    const UrlData = mongoose.model("UrlData", urlDataSchema);
    var postedURL = req.body.url;
    console.log(postedURL);

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
    } else {
      await collection
        .find({})
        .toArray()
        .then(async (data) => {
          let docNum = data.length;
          console.log(docNum);

          var newEntry = new UrlData({
            urlLong: postedURL,
            urlShort: docNum,
          });

          let checkUrl = data.filter((url) => url.urlLong === postedURL);
          if (checkUrl.length) {
            console.log(checkUrl[0]);
            res.json({
              original_url: checkUrl[0].urlLong,
              short_url: checkUrl[0].urlShort,
            });
          } else {
            await collection.insertOne(newEntry).then((data, err) => {
              console.log(data);
              if (err) return console.error(err);
              res.json({
                original_url: data.ops[0].urlLong,
                short_url: data.ops[0].urlShort,
              });
            });
          }
        });

      /*
      /*
          await collection.find({ urlLong: postedURL }).toArray().then(async (data) => {
            console.log(data);
            /*
              if (data.length) {
                console.log(returnedData);
                res.json({
                  original_url: returnedData[0].urlLong,
                  short_url: returnedData[0].urlShort,
                });
              } /*else {
                await collection.insertOne(newEntry).then((data) => {
                  console.log(data);
                  if (err) return console.error(err);
                  res.json({
                    original_url: data.urlLong,
                    short_url: data.urlShort,
                  });
                });
              }
              */
      // });
      // });
    }
  }
};
