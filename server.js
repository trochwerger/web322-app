/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Tomas Rochwerger Student ID: 159432210 Date: 09/30/2022
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 

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
  res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
});


data.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
  console.log(err);
});
