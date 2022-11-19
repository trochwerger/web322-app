
/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.    No part 
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

// Images Routing
app.get("/images/add", function(req, res){
  res.render('addImage')
});

app.get("/images", function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items) {
    res.render("images", {
      data: items
    });
  });
});

app.post("/images/add", upload.single("imageFile"), (req,res) => {
  res.redirect("/images");
});

app.get("/programs", function(req,res){
    data.getPrograms()
    .then((data) => { 
      if (data.length > 0) {
        res.render('programs', {programs: data});
      } else {
        res.render('programs', {message: "no results"});
      }
    })
    .catch((err) => { res.render("programs", {message: "no results"}); });
});

app.get("/programs/add", function(req, res){
  res.render('addProgram');
});

app.post("/programs/add", function(req, res){
  console.log(req.body);
  data.addProgram(req.body)
  .then(() => res.redirect("/programs"))
  .catch((err) => res.json({message: err}));
});

app.post("/program/update", function(req, res){
  data.updateProgram(req.body)
  .then(() => res.redirect("/programs"))
  .catch((err) => res.json({message: err}));
});

app.get("/programs/delete/:programCode", function(req, res){
  console.log(req.params.programCode);
  data.deleteProgramByCode(req.params.programCode)
  .then((data) => {
    res.redirect("/programs");
  })
  .catch((err) => { res.status(500).send("Unable to Remove Program / Program not found"); });
});

app.get("/program/:programCode", function(req, res){
  data.getProgramByCode(req.params.programCode)
  .then((data) => {
    console.log(data);
    res.render("program", {program: data});
  })
  .catch((err) => { res.render("program", {message: "no results"}); });
});

// Students Routing

app.get("/students", function(req,res){
  if (req.query.status){
    data.getStudentsByStatus(req.query.status)
    .then((data) => {
      if (data.length > 0){
        res.render("students", {students:data})
      } else {
        res.render("students", {message: "no results"});
      }
    }
    )
    .catch((err) => { res.render("students", {message: "no results"}); });
  } else if (req.query.program){
    data.getStudentsByProgram(req.query.program)
    .then((data) => {
      if (data.length > 0){
        res.render("students", {students:data})
      } else {
        res.render("students", {message: "no results"});
      }
    })
    .catch((err) => { res.render("students", {message: "no results"}); });
    } else if (req.query.credential){
      let credential = req.query.credential;
      data.getStudentsByExpectedCredential(credential)
    .then((data) => {
      if (data.length > 0){
        res.render("students", {students:data})
      }
      else {
        res.render("students", {message: "no results"});
      }
    })
    .catch((err) => { res.render("students", {message: "no results"}); });
  } else{
    data.getAllStudents()
    .then((data) => {
      if (data.length > 0){
        console.log("Data: ", data);
        res.render("students", {students:data})
      }
      else {
        res.render("students", {message: "no results"});
      }
    }
    )
    .catch((err) => { res.render("students", {message: "no results"}); });
  }
});

app.get("/intlstudents", function(req,res){
    data.getInternationalStudents()
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
});

app.get("/students/add", function(req,res){
  data.getPrograms()
  .then((data) => {
    res.render("addStudent", {programs: data});
  })
  .catch((err) => {
    res.render("addStudent", {programs: []});
  });
});

app.post("/students/add", function(req,res){
  console.log(req.body);
  data.addStudent(req.body)
  .then(() => res.redirect("/students"))
  .catch((err) => res.json({message: err}));
});

app.post("/student/update", (req, res) => { 
    data.updateStudent(req.body)
    .then(() => { res.redirect("/students"); })
    .catch((err) => { res.render("students", {message: "no results"}); });

});


app.get("/student/:studentId", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};

    dataService.getStudentById(req.params.studentId).then((data) => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(dataService.getPrograms)
    .then((data) => {
        viewData.programs = data; // store program data in the "viewData" object as "programs"

        // loop through viewData.programs and once we have found the programCode that matches
        // the student's "program" value, add a "selected" property to the matching 
        // viewData.programs object

        for (let i = 0; i < viewData.programs.length; i++) {
            if (viewData.programs[i].programCode == viewData.student.program) {
                viewData.programs[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.programs = []; // set programs to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    }).catch((err)=>{
        res.status(500).send("Unable to Show Students");
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
