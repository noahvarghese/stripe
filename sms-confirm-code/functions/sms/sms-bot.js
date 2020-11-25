// StAuth10065: I Noah Varghese, 000753196 certify that this material is my original work.
// No other person's work has been used without due acknowledgement.
// I have not made my work available to anyone else.

exports.handler = async function (context, event, callback) {
  var redis = require('redis');
  var axios = require('axios');
  var uniqid = require('uniqid');
  var twiml = new Twilio.twiml.MessagingResponse();
  require("dotenv").config();


  var redis_client = redis.createClient({
    url: process.env.REDIS_ENDPOINT,
    password: process.env.REDIS_PASSWORD
  });

  var incoming_message = event.Body.split(' ');
  var command = incoming_message[0].toLowerCase();
  var action = incoming_message[1];
  var details = incoming_message.splice(2).join(' ');

  switch (command) {
    case "update":
      let data = JSON.stringify({
        "status": action,
        "message": details,
        timestamp: (new Date()).getTime()
      });

      // console.log('data', data);
      let key = uniqid();

      redis_client.hset("messages", key, data, (err, _) => {

        if (err) {
          twiml.message(`Error inserting message: ${err}`);
        } else {

          redis_client.emit("new-message", JSON.stringify({
            key: key,
            data: data
          }));

          twiml.message(`Message inserted.`);
        }

        callback(null, twiml);
      });

      break;

    case "hogwarts":
      axios.get("https://www.potterapi.com/v1/sortingHat")
        .then(res => {
          if (res.data) {
            twiml.message(`Your Hogwarts house is ${res.data}`);
          } else {
            twiml.message(`There was an error picking your house`);
          }
          return callback(null, twiml);
        })
        .catch(err => {
          twiml.message(`There was an error picking your house... ${err}`);
          return callback(null, twiml);
        });
      //  Where you would implement your API response for texted requests
      //  https://www.twilio.com/docs/runtime/quickstart/serverless-functions-make-a-read-request-to-an-external-api
      break;

    case "helpme":
      twiml.message('List of commands:\nhogwarts -> returns your hogwarts house\nupdate [status] [message] -> status must be one word, message can be multiple words');

      callback(null, twiml);
      break;

  }
};