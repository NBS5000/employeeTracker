const inquirer = require('inquirer');
require('dotenv').config();

const db = require("./db/conn.js");
let staffList, roleList, deptList;
let cancel = false;



// WHOLE TABLE LIST
async function allStaff (){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee`;
    staffList = db.promise().query(q);
    return staffList;
}

async function allRoles (){

    const q = `SELECT title as Title, concat("$",salary) as Salary 
                FROM role`;
    roleList = db.promise().query(q);
    console.log(roleList);
    return roleList;
}

function allDept (){
    const q = `SELECT name 
                FROM department`;
    return db.promise().query(q);
    // return deptList;
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
                
    return;
}

function staffManagedBy (manager){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee as e
                INNER JOIN role as r ON e.role_id = r.id
                WHERE r.department_id = ?`;
                
    return q;
}



const addStuff = () => {
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
        // If user selects Employee
        {
            type: "input",
            message: " What is their \x1b[32mFirst\x1b[0m name?",
            name: "fname",
            when: (answers) => answers.toAdd == "Employee",
            validate(answer) {
                if(!answer) {
                    return "Their first name, what is it?"
                }
                return true
            }
        },
        {
            type: "input",

            name: "lname",
            when: (answers) => answers.fname,
            message(answers) {return `What is ${answers.fname}'s \x1b[32mLast\x1b[0m name?`;},
            validate(answer) {
                if(!answer) {
                    return "Their last name, what is it?"
                }
                return true
            }
        },
        {
            type: "confirm",
            name: "name",
            when: (answers) => answers.lname,
            message(answers) { return `\x1b[35mConfirm:\x1b[0m Add ${answers.fname} ${answers.lname} as an employee?`;},
            validate(answer) {
                if(!answer) {
                    return "Yes or no?"
                }
                return true
            }
        },
        // If user selects Department
        {
            type: "input",
            message: " What is the \x1b[32mDepartment\x1b[0m name?",
            name: "dept",
            when: (answers) => answers.toAdd == "Department",
            validate(answer) {
                if(!answer) {
                    return "The department name, what is it?"
                }
                return true
            }
        },
        {
            type: "input",
            message: (answers) => {`What is ${answers.dept}'s budget?`},
            name: "budget",
            when: (answers) => answers.dept === true,
            validate(answer) {
                if(!answer) {
                    return "Their budget, what is it?"
                }
                return true
            }
        },
        // If user selects Role
        {
            type: "input",
            message: " What is the \x1b[32mname\x1b[0m of the Role?",
            name: "role",
            when: (answers) => answers.toAdd == "Role",
            validate(answer) {
                if(!answer) {
                    return "The department name, what is it?"
                }
                return true
            }
        },
        {
            type: "number",
            message: (answers) => {`What is the salary for: ${answers.dept}?`},
            name: "budget",
            when: (answers) => answers.role === true,
            validate(answer) {
                if(!answer) {
                    return "The salary, what is it?"
                }
                return true
            }
        },
    ])
}
function viewStuff(){
    return inquirer.prompt([
        {
            type: "list",
            message: "What would you like to view?",
            choices: [
                "All Employees",
                "All Roles",
                "All Departments",
                "Cancel",
            ],
            name: 'toView',
        },
    ])
}
0

async function toDo_f(){

    const todo = await inquirer.prompt([
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
        }
    ]);
    if(todo.todo == "Exit"){
        cancel = true;
        return;
    }else if(todo.todo == "Add something"){

        let add = await addStuff();

        if(add.toAdd == "Cancel"){
            return;
        }else if(add.toAdd == "Employee"){
            // let x = await allStaff();
            // console.log(x);
        }else if(add.toAdd == "Department"){
            // let x = await allDept();
            // console.log(x);
        }else if(add.toAdd == "Role"){
            // let x = await allRoles();
            // console.log(x);
        }
        return;

    }else if(todo.todo == "View details"){

        let view = await viewStuff();

        if(view.toView == "Cancel"){
            return;
        }else if(view.toView == "All Employees"){
            let x = await allStaff();
            console.log(x);
        }else if(view.toView == "All Departments"){
            let x = await allDept();
            console.log(x);
        }else if(view.toView == "All Roles"){
            let x = await allRoles();
            console.log(x);
        }
        return;

    // }else if(todo.todo == "Update something"){

    // }else if(todo.todo == "Delete something"){

    }

}

async function begin() {

    console.info(`
    .---------------------------------------------------.
    |  \x1b[33m _        _       _                          _\x1b[0m   |
    |  \x1b[33m| |      | | ___ | | __  ____  _ __ _  ___  | |\x1b[0m  |
    |  \x1b[33m\\ \\  __  / /  _ \\| |/ _)/  _ \\| '  ' \\/ _ \\ |_|\x1b[0m  |
    |  \x1b[33m \\ \\/  \\/ /|  __/| | (_ | (_) | | |  |  __/  _\x1b[0m   |
    |  \x1b[33m  \\__/\\__/  \\___||_|\\__)\\____/|_|_|__|\\___| |_|\x1b[0m  |
    |                                                   |
    |                 To \x1b[33mStar Wars\x1b[0m pty                  |
    '---------------------------------------------------'
    
    `);

    while(!cancel){   
        await toDo_f();


    }
    process.exit();



}

begin();