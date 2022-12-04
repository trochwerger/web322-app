// fs = require('fs');  
// let students = [];
// let programs = [];
const Sequelize = require('sequelize');
var sequelize = new Sequelize('bkokjadb', 'bkokjadb', 'QaXp10LIn39k829eKd3VfuXlpFMxBS7W', {
	  host: 'peanut.db.elephantsql.com',
	  dialect: 'postgres',
	  port: 5432,
	  dialectOptions: {
		ssl: {rejectUnauthorized: false}
	  },
	  query: {raw: true}
	});

var Student = sequelize.define('Student', {
	  studentId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	  firstName: Sequelize.STRING,
	  lastName: Sequelize.STRING,
	  email: Sequelize.STRING,
	  phone: Sequelize.STRING,
	  addressStreet: Sequelize.STRING,
	  addressCity: Sequelize.STRING,
	  addressState: Sequelize.STRING,
	  addressPostal: Sequelize.STRING,
	  isInternationalStudent: Sequelize.BOOLEAN,
	  expectedCredential: Sequelize.STRING,
	  status: Sequelize.STRING,
	  registrationDate: Sequelize.STRING
	});

var Program = sequelize.define('Program', {
	programCode: { type: Sequelize.STRING, primaryKey: true},
	programName: Sequelize.STRING
});

Program.hasMany(Student, {foreignKey: 'program'});


module.exports = {

	initialize: function() {
		return new Promise(function(resolve, reject) {
			sequelize.sync().then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to sync the database");
			});
		});
	},

	getAllStudents: function(){
		return new Promise(function(resolve, reject){
			Student.findAll().then((data) => {
				resolve(data);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},

	getInternationalStudents: function(){
		return new Promise(function(resolve, reject){
			reject("Not implemented");
		});
	},

	getStudentsByStatus: function(status){
		return new Promise(function(resolve, reject){
			Student.findAll({
				where: {status: status}
			}).then((data) => {
				resolve(data);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},
	getStudentsByProgramCode: function(programCode){
		return new Promise(function(resolve, reject){
			Student.findAll({
				where: {program: programCode}
			}).then((data) => {
				resolve(data);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},
	getStudentsByExpectedCredential: function(credential){
		return new Promise(function(resolve, reject){
			Student.findAll({
				where: {expectedCredential: credential}
			}).then((data) => {
				resolve(data);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},

	getStudentById: function(sid){
		return new Promise(function(resolve, reject){
			Student.findAll({
				where: {studentId: sid}
			}).then((data) => {
				resolve(data[0]);
			}
			).catch((err) => {
				reject("no results returned");
			}
			);
		});
	},


	addStudent: function(studentData){
		studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
		return new Promise(function(resolve, reject){
			for (var key in studentData) {
				if (studentData[key] === "") {
					studentData[key] = null;
				}
			}
			Student.create(studentData).then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to create student");
			});
		});
	},

	updateStudent: function(studentData){
		return new Promise(function(resolve, reject){
			studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
			for (var key in studentData) {
				if (studentData[key] === "") {
					studentData[key] = null;
				}
			}
			
			Student.update(studentData, {where: {studentId: studentData.studentId}}).then(() => {
				resolve();
			}).catch((err) => {
				console.log(studentData);
				console.log(err);
				reject("unable to update student");
			});
		});
	},

	deleteStudent: function(sid){
		return new Promise(function(resolve, reject){
			Student.destroy({
				where: {studentId: sid}
			}).then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to delete student");
			});
		});
	},

	getPrograms: function(){
		return new Promise(function(resolve, reject){
			Program.findAll().then((data) => {
				resolve(data);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},
	addProgram: function(programData){
		return new Promise(function(resolve, reject){
			for (var key in programData) {
				if (programData[key] == "") {
					programData[key] = null;
				}
			}
			Program.create(programData).then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to create program");
			});
		});
	},
	updateProgram: function(programData){
		return new Promise(function(resolve, reject){
			for (var key in programData) {
				if (programData[key] == "") {
					programData[key] = null;
				}
			}
			Program.update(programData, {where: {programCode: programData.programCode}}).then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to update program");
			});
		});
	},
	getProgramByCode: function(programCode){
		return new Promise(function(resolve, reject){
			Program.findAll({
				where: {programCode: programCode}
			}).then((data) => {
				resolve(data[0]);
			}).catch((err) => {
				reject("no results returned");
			});
		});
	},
	deleteProgramByCode: function(programCode){
		return new Promise(function(resolve, reject){
			Program.destroy({
				where: {programCode: programCode}
			}).then(() => {
				resolve();
			}).catch((err) => {
				reject("unable to delete program");
			});
		});
	}
};