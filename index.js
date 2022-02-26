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



// const addQuestions = () => {
//     return inquirer.prompt([
//         {
//             type: "list",
//             message: "What would you like to add?",
//             choices: [
//                 "Employee",
//                 "Role",
//                 "Department",
//                 "Cancel",
//             ],
//             name: 'toAdd',
//         },

//     ])
// }
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
    // }else if(todo.todo == "Add something"){



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