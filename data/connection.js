const path = require('path');
const Engine = require('tingodb')();

let dbPath = path.join(__dirname, 'localDB')
let dbConn;

const connectToServer = async  () => {
    console.log('Connecting to server...');
    dbConn = new Engine.Db(dbPath, {});
    console.log("Successfully connected to TingoDB.");
    return dbConn;
  }

// Function for inserting a single document into the DB
const insertSingleDocument = async (incollection, document) => {
    const collection = dbConn.collection(incollection);
    collection.insert([document], {w:1}, function(err, result) {
        if (err) {
            console.log("Error inserting document:", err);
            return {status: "error", message: err};
        } else {
            console.log("Successfully inserted document:", result);
            return {status: "success", message: result};
        }
    });
}

// Function to get single document from DB
const getSingleDocument =  (incollection, query) => {
    const collection = dbConn.collection(incollection);
     collection.findOne(query, function(err, item) {
      if (err) {
          console.log("Error getting document:", err);
          return ({status: "error", message: "No document found"});
      } else {
          console.log("Successfully got document:", item);
          return ({status: "success", item});
      }
    });
}

// Function to get Many documents from DB
const getManyDocuments = (incollection, query) => {
  console.log("Getting documents from collection:", incollection);
  console.log("Query:", query);
    const collection = dbConn.collection(incollection);

    return new Promise((resolve, reject) => {
      collection.find(query).toArray(function(err, items) {
        if (err) {
            console.log("Error getting documents:", err);
            reject ({status: "error", message: "No documents found"});
        } else {
            console.log("Successfully got documents:", items);
            resolve ({status: "success", items});
        }
      });
    });
}
// // Function to get Many documents from DB
// const getManyDocuments = async (incollection, query) => {
//   console.log("Getting documents from collection:", incollection);
//   console.log("Query:", query);
//     const collection = dbConn.collection(incollection);
//       collection.find(query).toArray(function(err, items) {
//       if (err) {
//           console.log("Error getting documents:", err);
//           return ({status: "error", message: "No documents found"});
//       } else {
//           console.log("Successfully got documents:", items);
//           return ({status: "success", items});
//       }
//     });
// }

module.exports = {
    connectToServer,
    insertSingleDocument,
    getSingleDocument,
    getManyDocuments
} 

// module.exports = {
//   connectToServer: async function () {
//     console.log('Connecting to server...');
//     dbConn = new Engine.Db(dbPath, {});
//     console.log("Successfully connected to TingoDB.");
//     return dbConn;
//   },
//   // Function for inserting a single document into the DB
//   insertSingleDocument: async function (incollection, document) {
//       const collection = dbConn.collection(incollection);
//       collection.insert([document], {w:1}, function(err, result) {
//           if (err) {
//               console.log("Error inserting document:", err);
//               return {status: "error", message: err};
//           } else {
//               console.log("Successfully inserted document:", result);
//               return {status: "success", message: result};
//           }
//       });
//   },
//   // Function to get single document from DB
//   getSingleDocument: async function (incollection, query) {
//       const collection = dbConn.collection(incollection);
//       await collection.findOne(query, function(err, item) {
//         if (err) {
//             console.log("Error getting document:", err);
//             return ({status: "error", message: "No document found"});
//         } else {
//             console.log("Successfully got document:", item);
//             return ({status: "success", item});
//         }
//       });
//   },
// };

// https://codesandbox.io/s/rs8p0?file=/src/infra/db.js:0-165
// const Db = require("tingodb")({
//   memStore: true
// }).Db;

// function makeDatabase() {
//   var db = new Db("/counter", {});
//   return db;
// }

// module.exports = makeDatabase;
