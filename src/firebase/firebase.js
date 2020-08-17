var admin = require("firebase-admin");

var serviceAccount = require("../norse-coral-221214-firebase-adminsdk-uosd9-1bc34050f8.json");

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://norse-coral-221214.firebaseio.com"
});

module.exports.admin = admin;