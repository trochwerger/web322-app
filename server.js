
/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Tomas Rochwerger Student ID: 159432210 Date: 09/30/2022
*
*  Online (Cyclic) Link: https://filthy-tuna-pumps.cyclic.app
*
********************************************************************************/ 


const express = require("express");
const multer = require("multer");
const data = require("./data-service.js");
var app = express();
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
var path = require("path");


var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}
app.use(express.static('public')); 

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/students/add", function(req, res){
  res.sendFile(path.join(__dirname,"views/addStudent.html"))
});

app.get("/images/add", function(req, res){
  res.sendFile(path.join(__dirname,"views/addImage.html"))
});

app.get("/programs", function(req,res){
    data.getPrograms()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
});

app.get("/students", function(req,res){
  if (req.query.status){
    let status = req.query.status;
    data.getStudentsByStatus(status)
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
  }
  else if (req.query.program){
    let programCode = req.query.program;
    data.getStudentsByProgramCode(programCode)
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
  }
  else if (req.query.credential){
    let credential = req.query.credential;
    data.getStudentsByExpectedCredential(credential)
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
  } else{
    data.getAllStudents()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
  }
});

app.get("/student/:value", function(req,res){
  let sid = req.params.value;
  data.getStudentById(sid)
  .then((data) => { res.json(data); })
  .catch((err) => { res.json({message: err}); });
});


app.get("/intlstudents", function(req,res){
    data.getInternationalStudents()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({message: err}); });
});

app.post("/images/add", upload.single("imageFile"), (req,res) => {
  res.redirect("/images");
});

app.post("/students/add", function(req, res) {
  data.addStudent(req.body)
  .then(() => { res.redirect("/students"); })
  .catch((err) => { res.json({message: err}); });
});

app.get("/images", function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items) {
    res.json(items);
  });
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
