const inquirer = require('inquirer');
const questions = require('.assets/js/questions.js');

// Import and require mysql2
const mysql = require('mysql2');
// Apply .env config
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password - get from .env file or use default
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    },
    console.log(`Connected to the employee_db database.`)
  );



// WHOLE TABLE LIST
function allStaff (){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee`;

    return q;
}

function allRoles (){

    const q = `SELECT title 
                FROM role`;

    return q;
}

function allDept (){
    const q = `SELECT name 
                FROM department`;

    return q;
}

///////////////////////////////////////
function staffInRole (role){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee as e
                INNER JOIN role as r ON e.role_id = r.id
                WHERE r.title = ${role}`;
                
    return q;
}

function staffInDept (dept){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee as e
                INNER JOIN role as r ON e.role_id = r.id
                WHERE r.department_id = ?`;
                
    return q;
}

function staffManagedBy (manager){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee as e
                INNER JOIN role as r ON e.role_id = r.id
                WHERE r.department_id = ?`;
                
    return q;
}




const toDoQuestion = () => {
    return inquirer.prompt([
        {  
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View details",
                "Add something",
                "Update something",
                "Delete something",
                "Exit",
            ],
            name: 'todo',
        },
    ])
};

const addQuestions = () => {
    return inquirer.prompt([
        {
            type: "list",
            message: "What would you like to add?",
            choices: [
                "Employee",
                "Role",
                "Department",
                "Cancel",
            ],
            name: 'toAdd',
        },
        {
            // If previous answer was yes, then ask for details of the image
            type: "list",
            message: "What is their first name?",
            name: "fname",
            when: (answers) => answers.todo == "An employee",
        },
        {
            // If previous answer was yes, then ask for details of the image
            type: "list",
            message: "What is their last name?",
            name: "lname",
            when: (answers) => answers.fname === true,
        },
    ])
}