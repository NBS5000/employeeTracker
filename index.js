const inquirer = require('inquirer');
const util = require('util');
require('dotenv').config();

const db = require("./db/conn.js");
let staffList, roleList, deptList;
let cancel = false;
const Table = require('easy-table');
const { json } = require('express');



// WHOLE TABLE LIST
async function allStaff (){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee`;
    [rows,fields] = await db.promise().query(q);
    staffList = rows;
    return staffList;
}

async function allRoles (){

    const q = `SELECT title as Title, concat("$",salary) as Salary 
                FROM role`;
    [rows,fields] = await db.promise().query(q);
    roleList = rows;
    return roleList;
}

async function allDept (){
    let t;
    const q = `SELECT name, concat("$",budget) as budget
                FROM department`;
    [rows,fields] = await db.promise().query(q);

    deptList = rows;
    return deptList;
        
        
};




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
const addEmployee = (staff,roles) => {
    return inquirer.prompt([
        // If user selects Employee
        {
            type: "input",
            message: "What is their \x1b[32mFirst\x1b[0m name?",
            name: "fname",
            // when: (answers) => answers.toAdd == "Employee",
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
            type: "list",
            name: "role",
            when: (answers) => answers.lname,
            message(answers) { return `What will ${answers.fname} ${answers.lname}'s \x1b[35mrole\x1b[0m?`;},
            choices: roles,
        },
        {
            type: "list",
            name: "man",
            when: (answers) => answers.role,
            message(answers) { return `Who will be the \x1b[35mmanager\x1b[0m of ${answers.fname} ${answers.lname}?`;},
            choices: staff,
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

        const add = await addStuff();
        let loop, len;


        if(add.toAdd == "Cancel"){
            return;
        }else if(add.toAdd == "Employee"){
            const manList = await allStaff();

            console.log(manList);
            len = manList.length;
            loop = 0;
            let manArr = [];
            while(loop < len){
                manArr.push(manList[loop].Name);
                loop++;
            };
            const roleList = await allRoles();
            len = roleList.length;
            loop = 0;
            let roleArr = [];
            while(loop < len){
                roleArr.push(roleList[loop].Title);
                loop++;
            };
            const newEmp = await addEmployee(manList, roleArr);
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "confEmp",
                    message: `\x1b[35mDo you wish to add:\x1b[0m \nEmployee: ${newEmp.fname} ${newEmp.lname} \nRole: ${newEmp.role} \nManaged by: ${newEmp.man}?`,
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                },
            ])
            const empRole = db.query("SELECT id FROM role WHERE title = ?",newEmp.role);
            // const empMan = db.query("SELECT id FROM mployee WHERE title = ?",newEmp.role)
            const values = {fname: newEmp.fname, lname: newEmp.lname,role_id: empRole,manager_id:12};
            db.query("INSERT INTO employee SET ?",values,function(err,res){
                if(err) throw err;
            })

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

            // let t = new Table();
            // x.forEach(function (role) {
            //     t.cell('Department Name', role.name),
            //     t.cell('Budget', role.budget),
            //     t.newRow()
            // })
            // console.log(t);
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