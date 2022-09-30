fs = require('fs');
let students = [];
let programs = [];

module.exports = {
	
/*initialize()

•	This function will read the contents of the "./data/students.json" file

hint: see the fs module & the fs.readFile method, ie (from the documentation):

fs.readFile('somefile.json', 'utf8', (err, data) => {
     if (err) throw err;
     console.log(data);
});

Do not forget convert the file's contents into an array of objects (hint: see JSON.parse) , and assign that array to the students array (from above).  
•	Only once the read operation for "./data/students.json" has completed successfully (not before), repeat the process for the "./data/programs.json" and assign the parsed object array to the programs array from above.
•	Once these two operations have finished successfully, invoke the resolve method for the promise to communicate back to server.js that the operation was a success.
•	If there was an error at any time during this process, instead of throwing an error, invoke the reject method for the promise and pass an appropriate message, ie: reject("unable to read file").

*/
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
	/*
	getAllStudents()

	•	This function will provide the full array of "student" objects using the resolve method of the 
	returned promise.  
	•	If for some reason, the length of the array is 0 (no results returned), this function must invoke the reject method and pass a meaningful message, ie: "no results returned".

	*/

	getAllStudents: function(){
		return new Promise(function(resolve, reject){
			if (students.length == 0) reject("no results returned");
			resolve(students);
		});
	},

	/*
	getInternationalStudents()

	•	This function will provide an array of "student" objects whose isInternationalStudent property is true using the resolve method of the returned promise.  
	•	If for some reason, the length of the array is 0 (no results returned), this function must invoke the reject method and pass a meaningful message, ie: "no results returned".

	*/

	getInternationalStudents: function(){
		return new Promise(function(resolve, reject){
			let intlStudents = students.filter(function(student){
				return student.isInternationalStudent;
			});
			if (intlStudents.length == 0) reject("no results returned");
			resolve(intlStudents);
		});
	},

	/*
	getPrograms()

	•	This function will provide the full array of "program" objects using the resolve method of the 
	returned promise.  
	•	If for some reason, the length of the array is 0 (no results returned), this function must invoke the reject method and pass a meaningful message, ie: "no results returned".
	*/

	getPrograms: function(){
		return new Promise(function(resolve, reject){
			if (programs.length == 0) reject("no results returned");
			resolve(programs);
		});
	}		
};

