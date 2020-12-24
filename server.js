"use strict";
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
const { Schema } = mongoose;
var URL = require("url").URL;
var cors = require("cors");
var bodyParser = require("body-parser");
const dns = require("dns"); // check if valid url
var app = express();

require("dotenv").config();
// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Gonna check db connection first
const db = mongoose.connection;

app.use(cors({ optionsSuccessStatus: 200 }));

/** this project needs to parse POST bodies **/
// app.use(express.json());
// different Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(process.cwd() + "/public"));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const stringIsAValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
};

// Wrap in function to run only once DB is connected

db.once("open", () => {
  // Setting Schema here instead of other folder
  // because I want to watch the 2020 Election live Stream
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
    //});
  });
});

app.listen(port, function () {
  console.log("Node.js listening ..." + `${port}`);
});
