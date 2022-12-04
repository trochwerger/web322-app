
/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.    No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Tomas Rochwerger Student ID: 159432210 Date: 09/30/2022
*
*  Online (Cyclic) Link: https://filthy-tuna-pumps.cyclic.app
*
********************************************************************************/ 

//mongodb+srv://dbUser:suqbi6-dorXom-syqjiv@senecaweb.e9ew8p5.mongodb.net/Web322Assignment?retryWrites=true&w=majority

const express = require("express");
const multer = require("multer");
const data = require("./data-service.js");
const exphbs = require("express-handlebars");
const dataServiceAuth = require("./data-service-auth.js")
const clientSessions = require("client-sessions");
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

app.use(clientSessions({
  cookieName: "session", 
  secret: "web322Assignment", 
  duration: 2 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

//	Define a helper middleware function (ie: ensureLogin from the Week 10 notes) that checks if a user is logged in (we will use this in all of our employee / department routes).  If a user is not logged in, redirect the user to the "/login" route.
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};


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

// Routes assignment 6
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  dataServiceAuth.registerUser(req.body)
  .then(() => {
    res.render("register", {successMessage: "User created"});
  })
  .catch((err) => {
    res.render("register", {errorMessage: err, userName: req.body.userName});
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
  .then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }
    res.redirect('/students');
  })
  .catch((err) => {
    console.log(err);
    res.render("login", {errorMessage: err, userName: req.body.userName});
  });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});




// Images Routing
app.get("/images/add", ensureLogin, function(req, res){
  res.render('addImage')
});

app.get("/images",  ensureLogin, function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items) {
    res.render("images", {
      data: items
    });
  });
});

app.post("/images/add",upload.single("imageFile"), ensureLogin,(req,res) => {
  res.redirect("/images");
});

app.get("/programs",  ensureLogin, function(req,res){
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

app.get("/programs/add", ensureLogin, function(req, res){
  res.render('addProgram');
});

app.post("/programs/add", ensureLogin, function(req, res){
  console.log(req.body);
  data.addProgram(req.body)
  .then(() => res.redirect("/programs"))
  .catch((err) => res.json({message: err}));
});

app.post("/program/update", ensureLogin, function(req, res){
  data.updateProgram(req.body)
  .then(() => res.redirect("/programs"))
  .catch((err) => res.json({message: err}));
});

app.get("/programs/delete/:programCode", ensureLogin, function(req, res){
  console.log(req.params.programCode);
  data.deleteProgramByCode(req.params.programCode)
  .then((data) => {
    res.redirect("/programs");
  })
  .catch((err) => { res.status(500).send("Unable to Remove Program / Program not found"); });
});

app.get("/program/:programCode", ensureLogin, function(req, res){
  let programCode = req.params.programCode;
  data.getProgramByCode(programCode)
  .then((data) => {
    console.log(data);
    res.render("program", {program: data});
  })
  .catch((err) => { res.render("program", {message: "no results"}); });
});

// Students Routing

app.get("/students",  ensureLogin, function(req,res){
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
    data.getStudentsByProgramCode(req.query.program)
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
        console.log(data);
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

app.get("/intlstudents",  ensureLogin, function(req,res){
    data.getInternationalStudents()
    .then((data) => { res.render("students", {students: data}); })
    .catch((err) => { res.render("students", {message: "no results"}); });
});

app.get("/students/add",  ensureLogin, function(req,res){
  data.getPrograms()
  .then((data) => {
    res.render("addStudent", {programs: data});
  })
  .catch((err) => {
    res.render("addStudent", {programs: []});
  });
});

app.get("/students/delete/:studentId",  ensureLogin, function(req, res){
  data.deleteStudent(req.params.studentId)
  .then((data) => {
    res.redirect("/students");
  })
  .catch((err) => { res.status(500).send("Unable to Remove Student / Student not found"); });
});

app.post("/students/add",  ensureLogin, function(req,res){
  data.addStudent(req.body)
  .then(() => res.redirect("/students"))
  .catch((err) => console.log(err));
});

app.post("/student/update",  ensureLogin, (req, res) => { 
    data.updateStudent(req.body)
    .then(() => { 
      console.log(req.body);
      res.redirect("/students"); })
    .catch((err) => { 
      console.log(err);
      res.render("students", {message: "no results"}); });

});


app.get("/student/:studentId",  ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};

    data.getStudentById(req.params.studentId).then((data) => {
        if (data) {
          console.log("Data: ", data);
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(data.getPrograms)
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

data.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

