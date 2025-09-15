//imports required modules
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express(); //Creates an Express application object,app is for app.get/post..

app.use(express.static("public")); //Tells Express to serve static files (like CSS,images,JS) from the public folder.

app.use(bodyParser.urlencoded({ extended: true })); //access form fields via req.body.Fname, req.body.email, etc.

//bl home page bt3rdle l content of this html file
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

//This executes when the user submits the signup form.
app.post("/", function (req, res) {
  //Extracts the form inputs from signup.html.
  // name="Fname" in HTML → req.body.Fname in Express.
  const firstName = req.body.Fname;
  const lastName = req.body.Lname;
  const email = req.body.email;

  //Creates a JSON object in the format Mailchimp expects:
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  //Converts the object into a JSON string.
  const jsonData = JSON.stringify(data);
  //Configuring Mailchimp API Request
  const url = "https://us13.api.mailchimp.com/3.0/lists/f7ffc02c90"; //URL to your Mailchimp audience(list).
  // "us13" is the data center from your API key (-us13),"f7ffc02c90" is your list ID.

  const options = {
    method: "POST",
    auth: "anystring:505454949e6e765bccc163e3e25e0407-us13",
  }; //Configures the request: method:"POST" → we are creating a new subscriber, auth , apikey

  //creates a request object to send data to Mailchimp API.
  // url and options specify where and how to send.
  const request = https.request(url, options, function (response) {
    console.log("Status Code:", response.statusCode);
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    //Listens for data chunks from Mailchimp.
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  }); //Ends the callback for https.request.

  request.write(jsonData); //sends the JSON payload (subscriber info).
  request.end(); //signals that the request is finished and can be sent.

  // Here you can handle the form data, e.g., save it to a database
});

///retry route for failure
app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
