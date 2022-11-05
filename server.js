
/*********************************************************************************
*  WEB322 – Assignment 04
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
const exphbs = require("express-handlebars");
var app = express();
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
var path = require("path");
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: {
    navLink: function(url, options){
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      }
  } 
}));
app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});



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
    res.render('home');
});



// setup another route to listen on /about
app.get("/about", function(req,res){
    res.render('about');
});

app.get("/students/add", function(req, res){
  res.render('addStudent');
  app.locals.activeRoute = "/students/add";
});

app.get("/images/add", function(req, res){
  res.render('addImage')
});

app.get("/programs", function(req,res){
    data.getPrograms()
    .then((data) => { res.render("programs", {programs:data})})
    .catch((err) => { res.render("programs", {message: "no results"}); });
});

app.get("/students", function(req,res){
  if (req.query.status){
    let status = req.query.status;
    data.getStudentsByStatus(status)
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
  }
  else if (req.query.program){
    let programCode = req.query.program;
    data.getStudentsByProgramCode(programCode)
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
  }
  else if (req.query.credential){
    let credential = req.query.credential;
    data.getStudentsByExpectedCredential(credential)
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
  } else{
    data.getAllStudents()
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
  }
});

app.get("/student/:studentId", function(req,res){
  let sid = req.params.studentId;
  data.getStudentById(sid)
  .then((data) => { res.render("student", {student: data}); })
  .catch((err) => { res.render("student", {message: "no results"}); });
});


app.get("/intlstudents", function(req,res){
    data.getInternationalStudents()
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
});

app.post("/images/add", upload.single("imageFile"), (req,res) => {
  res.redirect("/images");
});

app.post("/students/add", function(req, res) {
  data.addStudent(req.body)
  .then(() => { res.redirect("/students"); })
  .catch((err) => { res.render("students", {message: "no results"}); });
});

app.post("/student/update", (req, res) => {
      //invoke the updateStudent() method with the req.body as the parameter
    //Once the promise is resolved use the then() callback to execute the res.redirect("/students"); code
    //If the promise is rejected, use the catch() callback to execute the res.render("students", {message: "no results"}); code
    data.updateStudent(req.body)
    .then(() => { res.redirect("/students"); })
    .catch((err) => { res.render("students", {message: "no results"}); });
});


app.get("/images", function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items) {
    res.render("images", {
      data: items
    });
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
