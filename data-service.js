fs = require('fs');
let students = [];
let programs = [];

module.exports = {
	
	initialize: function() {
		return new Promise((resolve, reject) => {
			fs.readFile('./data/students.json', 'utf8', (err, data) => {
				if (err) {
					reject("unable to read file");
				} else {
					students = JSON.parse(data);
					fs.readFile('./data/programs.json', 'utf8', (err, data) => {
						if (err) {
							reject("unable to read file");
						} else {
							programs = JSON.parse(data);
							resolve();
						}
					});
				}
			});
		});
	},

	getAllStudents: function(){
		return new Promise(function(resolve, reject){
			if (students.length == 0) reject("no results returned");
			resolve(students);
		});
	},

	getInternationalStudents: function(){
		return new Promise(function(resolve, reject){
			let intlStudents = students.filter(function(student){
				return student.isInternationalStudent;
			});
			if (intlStudents.length == 0) reject("no results returned");
			resolve(intlStudents);
		});
	},

	getPrograms: function(){
		return new Promise(function(resolve, reject){
			if (programs.length == 0) reject("no results returned");
			resolve(programs);
		});
	},
	getStudentsByStatus: function(status){
		return new Promise(function(resolve, reject){
			let statusStudents = students.filter(function(student){
				return  student.status== status.replace(/%/g, " ");;
			});
			if (statusStudents.length == 0) reject("no results returned");
			resolve(statusStudents);
		});
	},
	getStudentsByProgramCode: function(programCode){
		return new Promise(function(resolve, reject){
			let programStudents = students.filter(function(student){
				return student.program == programCode;
			});
			if (programStudents.length == 0) reject("no results returned");
			resolve(programStudents);
		});
	},
	getStudentsByExpectedCredential: function(credential){
		return new Promise(function(resolve, reject){
			let credentialStudents = students.filter(function(student){
				return student.expectedCredential == credential;
			});
			if (credentialStudents.length == 0) reject("no results returned");
			resolve(credentialStudents);
		});
	},

	getStudentById: function(sid){
		return new Promise(function(resolve, reject){
			let student = students.filter(function(student){
				return student.studentID == sid;
			});
			if (!student) reject("no results returned");
			resolve(student);
		});
	},
	
	addStudent: function(studentData){
		return new Promise(function(resolve, reject){
			if (studentData.isInternationalStudent == undefined) studentData.isInternationalStudent = false;
			else studentData.isInternationalStudent = true;
			let studentIDs = students.map(function(student){
				return parseInt(student.studentID);
			});
			studentData.studentID = (Math.max(...studentIDs) + 1).toString();
			students.push(studentData);
			resolve();
		});
	}

};

