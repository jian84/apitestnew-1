//firebase notification
var admin = require("firebase-admin");
var serviceAccount = require("../firebasekey/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://horang-2020.firebaseio.com"
});
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};
//end firebase notification

router.post('/firebase/notification', (req, res)=>{
  const  registrationToken = req.body.registrationToken
  const message = req.body.message
  const options =  notification_options
  
    admin.messaging().sendToDevice(registrationToken, message, options)
    .then( response => {

     res.status(200).send("Notification sent successfully")
     
    })
    .catch( error => {
        console.log(error);
    });

});