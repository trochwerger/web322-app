/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
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

// In addition to providing all of the students, this route must now also support the following optional filters (via the query string)
// /students?status=value 
// return a JSON string consisting of all students where value could be either "Full Time" or "Part Time" - this can be accomplished by calling the getStudentsByStatus(status) function of your data-service 

// app.get("/students/:status", function(req,res){
//   data.getStudentsByStatus(req.params.status)
//   .then((data) => { res.json(data); })
//   .catch((err) => { res.json({message: err}); });
// });

// students?program=value 
// return a JSON string consisting of all students where value could be one of "ACF", "AVO", "DAN", "CPP", "CPA", …  (there are currently 10 programs in the dataset) " - this can be accomplished by calling the getStudentsByProgramCode(programCode) function of your data-service 
// app.get("/students/:program", function(req,res){
//   data.getStudentsByProgramCode(req.params.program)
//   .then((data) => { res.json(data); })
//   .catch((err) => { res.json({message: err}); });
// });

// /students?credential=value 
// return a JSON string consisting of all students where value could be one of "Diploma", "Degree" and "Certificate" (there are currently 3 (expected) credentials in the dataset) " - this can be accomplished by calling the getStudentsByExpectedCredential(credential) function of your data-service (defined below)

// app.get("/students/:credential", function(req,res){
//   data.getStudentsByExpectedCredential(req.params.credential)
//   .then((data) => { res.json(data); })
//   .catch((err) => { res.json({message: err}); });
// });

// Add the "/student/value" route 
// This route will return a JSON formatted string containing the student whose studentID matches the value.  For example, once the assignment is complete, http://localhost:8080/student/408862098  would return the student: Vivi Foulks - this can be accomplished by calling the getStudentById(sid) function of your data-service (defined below).


//This route will return a JSON formatted string containing the student whose studentID matches the value.  For example, once the assignment is complete, http://localhost:8080/student/408862098  would return the student: Vivi Foulks - this can be accomplished by calling the getStudentById(sid) function of your data-service (defined below).

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
