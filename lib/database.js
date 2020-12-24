const MongoClient = require("mongodb").MongoClient;

let cachedDb = null;

export const connectToDb = async () => {
  if (cachedDb) {
    console.log("Db Returned");
    return Promise.resolve(cachedDb);
  } else {
    return MongoClient.connect(process.env.MONGO_URI, {
      // might break on parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        let db = client.db("url_shortener");
        console.log("New Connection");
        cachedDb = db;
        return cachedDb;
      })
      .catch((error) => {
        console.log(error);
      });
  }
};
