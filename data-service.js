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
	}		
};

