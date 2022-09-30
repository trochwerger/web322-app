const express = require("express");
const data = require("./data-service.js");
var app = express();

var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}
app.use(express.static('public')); 

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/programs", function(req,res){
    data.getPrograms()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
});

app.get("/students", function(req,res){
    data.getAllStudents()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
});

app.get("/intlstudents", function(req,res){
    data.getInternationalStudents()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
});



// setup a route to listen on no matching route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});


data.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
  console.log(err);
});
