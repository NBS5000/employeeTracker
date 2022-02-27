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
    const q = `SELECT concat(fname," ",lname) as Name, r.title as Role 
                FROM employee as e
                INNER JOIN role as r on e.role_id = r.id`;
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


const updateStuff = () => {
    return inquirer.prompt([
        {
            type: "list",
            message: "What would you like to update?",
            choices: [
                "Employee",
                "Role",
                "Department",
                "Cancel",
            ],
            name: 'toUpdate',
        },
    ])
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
    ])
}

const addRole = (deptList) => {
    return inquirer.prompt([
        {
            type: "input",
            message: "What is the \x1b[32mName\x1b[0m of the role?",
            name: "rname",
            validate(answer) {
                if(!answer) {
                    return "The role name, what is it?"
                }
                return true
            }
        },
        {
            type: "input",
            name: "salary",
            when: (answers) => answers.rname,
            message(answers) {return `What is the \x1b[32msalary\x1b[0m for the position of ${answers.rname}?`;},
            validate(answer) {
                if(isNaN(answer)){
                    return "Enter a number, with no letters or other characters";

                }else if(!answer) {
                    return "The salary, what is it?"
                }
                return true
            }
        },
        {
            type: "list",
            name: "dept",
            when: (answers) => answers.salary,
            message(answers) { return `Which \x1b[35mdepartment\x1b[0m will the ${answers.rname} belong to??`;},
            choices: deptList,
        },
    ])
}
const addDept = () => {
    return inquirer.prompt([
        {
            type: "input",
            message: "What is the \x1b[32mName\x1b[0m of the department?",
            name: "dname",
            validate(answer) {
                if(!answer) {
                    return "The department name, what is it?"
                }
                return true
            }
        },
        {
            type: "input",
            name: "budget",
            when: (answers) => answers.dname,
            message(answers) {return `What is the \x1b[32mbudget\x1b[0m for the ${answers.dname} department?`;},
            validate(answer) {
                if(isNaN(answer)){
                    return "Enter a number, with no letters or other characters";

                }else if(!answer) {
                    return "Their budget, what is it?"
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
            const newEmp = await addEmployee(manArr, roleArr);
            const addConfEmp = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "confEmp",
                    message: `\x1b[35mDo you wish to add:\x1b[0m \n\x1b[34mEmployee:\x1b[0m ${newEmp.fname} ${newEmp.lname} \n\x1b[34mRole:\x1b[0m ${newEmp.role} \n\x1b[34mManaged by:\x1b[0m ${newEmp.man}?`,
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                },
            ])
            if(addConfEmp.confEmp == "Yes" || addConfEmp.confEmp === true){
                [rows,fields] = await db.promise().query("SELECT id FROM role WHERE title = ?",newEmp.role);
                let newRole = parseInt(rows[0].id);

                [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,newEmp.man );
                let newMan = parseInt(rows[0].id);
                const values = {fname: newEmp.fname, lname: newEmp.lname,role_id: newRole,manager_id:newMan};
                try{
                    await db.promise().query("INSERT INTO employee SET ?",values)
                    console.log(`${newEmp.fname} ${newEmp.lname} was \x1b[32msuccessfully\x1b[0m added\n`)
                }catch(err){
                    console.log(`${newEmp.fname} ${newEmp.lname} was \x1b[31mnot\x1b[0m added: ${err}\n`)
                }
            }else{
                console.log(`${newEmp.fname} ${newEmp.lname} was \x1b[31mnot\x1b[0m added\n`)
            }
        }else if(add.toAdd == "Department"){

            const newDept = await addDept();
            const addConfDept = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "confDept",
                    message: `\x1b[35mDo you wish to add:\x1b[0m \n\x1b[34mDepartment:\x1b[0m ${newDept.dname} \n\x1b[34mBudget:\x1b[0m ${newDept.budget}?`,
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                },
            ])
            if(addConfDept.confDept == "Yes" || addConfDept.confDept === true){

                const values = {name: newDept.dname, budget: newDept.budget};
                try{
                    await db.promise().query("INSERT INTO department SET ?",values);
                    console.log(`${newDept.dname} was \x1b[32msuccessfully\x1b[0m added\n`);
                }catch(err){
                    console.log(`${newDept.dname} was \x1b[31mnot\x1b[0m added: ${err}\n`);
                }
            }else{
                console.log(`${newDept.dname} was \x1b[31mnot\x1b[0m added\n`);
            }
        }else if(add.toAdd == "Role"){
            const dList = await allDept();

            len = dList.length;
            loop = 0;
            let dArr = [];
            while(loop < len){
                dArr.push(dList[loop].name);
                loop++;
            };
            const newRole = await addRole(dArr);
            const addConfRole = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "confRole",
                    message: `\x1b[35mDo you wish to add:\x1b[0m \n\x1b[34mRole Name:\x1b[0m ${newRole.rname} \n\x1b[34mSalary:\x1b[0m ${newRole.salary} \n\x1b[34mDepartment:\x1b[0m ${newRole.dept}?`,
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                },
            ])
            if(addConfRole.confRole == "Yes" || addConfRole.confRole === true){
                [rows,fields] = await db.promise().query("SELECT id FROM department WHERE name = ?",newRole.dept);
                let newDeptAdd = parseInt(rows[0].id);

                const values = {title: newRole.rname,salary: newRole.salary,department_id:newDeptAdd};
                try{
                    await db.promise().query("INSERT INTO role SET ?",values)
                    console.log(`${newRole.rname} was \x1b[32msuccessfully\x1b[0m added\n`)
                }catch(err){
                    console.log(`${newRole.rname} was \x1b[31mnot\x1b[0m added: ${err}\n`)
                }
            }else{
                console.log(`${newRole.rname} was \x1b[31mnot\x1b[0m added\n`)
            }
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
            //     t.cell('Title', role.Title),
            //     t.cell('Salary', role.Salary),
            //     t.newRow()
            // })
            // console.log(t);
            console.log(x);
        }
        return;

    }else if(todo.todo == "Update something"){
        let update = await updateStuff();

        if(update.toUpdate == "Cancel"){
            return;
        }else if(update.toUpdate == "Employee"){
            const updEmpList = await allStaff();

            len = updEmpList.length;
            loop = 0;
            let empArr = [];
            while(loop < len){
                empArr.push(updEmpList[loop].Name);
                loop++;
            };

            const selectEmp = await inquirer.prompt([
                {
                    type: "list",
                    name: "emp",
                    message: "Who would you like to update?",
                    choices: empArr,
                },
                {
                    type: "list",
                    name: "empUp",
                    when: (answers) => answers.emp,
                    message(answers) { return `Which element of \x1b[35m${answers.emp}\x1b[0m do you wish to update?`;},
                    choices: [
                        "First name",
                        "Last name",
                        "Their role",
                        "Their manager",
                        "Cancel",
                    ]
                },
            ]);

            if(selectEmp.empUp == "Cancel"){
                return;
            }else if(selectEmp.empUp == "First name"){
                const upFName = await inquirer.prompt([
                    {
                        type: "input",
                        name: "upfname",
                        message: `What would you like to update ${selectEmp.emp}'s first name to?`,
                        validate(answer) {
                            if(!answer) {
                                return "What is their new first name?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${selectEmp.emp}\x1b[0m's first name to ${answers.upfname}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upFName.conf == "no" || upFName.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectEmp.emp );
                    let empUpId = parseInt(rows[0].id);
                    let upNewName = upFName.upfname;
                    // const values = `[${}, ${}]`;
                    try{
                        await db.promise().query("UPDATE employee SET fname = ? WHERE id = ?",[upNewName,empUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;

            }else if(selectEmp.empUp == "Last name"){
                const upLName = await inquirer.prompt([
                    {
                        type: "input",
                        name: "uplname",
                        message: `What would you like to update ${selectEmp.emp}'s last name to?`,
                        validate(answer) {
                            if(!answer) {
                                return "What is their new last name?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${selectEmp.emp}\x1b[0m's last name to ${answers.uplname}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upLName.conf == "no" || upLName.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectEmp.emp );
                    let empUpId = parseInt(rows[0].id);
                    let upNewName = upLName.uplname;
                    // const values = `[${}, ${}]`;
                    try{
                        await db.promise().query("UPDATE employee SET lname = ? WHERE id = ?",[upNewName,empUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;



            }else if(selectEmp.empUp == "Their role"){
                const roleList = await allRoles();
                
                len = roleList.length;
                loop = 0;
                let roleArr = [];
                while(loop < len){
                    roleArr.push(roleList[loop].Title);
                    loop++;
                };
                const upRole = await inquirer.prompt([
                    {
                        type: "list",
                        name: "uprole",
                        message: `What would you like to update ${selectEmp.emp}'s role to?`,
                        choices: roleArr,
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${selectEmp.emp}\x1b[0m's role to ${answers.uprole}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ])
                if(upRole.conf == "no" || upRole.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectEmp.emp );
                    let empUpId = parseInt(rows[0].id);

                    [rows,fields] = await db.promise().query(`SELECT id FROM role WHERE title LIKE ?`,upRole.uprole );
                    let newRoleId = parseInt(rows[0].id);
                    // const values = `[${}, ${}]`;
                    try{
                        await db.promise().query("UPDATE employee SET role_id = ? WHERE id = ?",[newRoleId,empUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;



            }else if(selectEmp.empUp == "Their manager"){



            }








            // let x = await allStaff();
            // console.log(x);
        }else if(update.toUpdate == "A Department"){
            let x = await allDept();
            console.log(x);
        }else if(update.toUpdate == "A Role"){

            let x = await allRoles();






    // }else if(todo.todo == "Delete something"){

    }
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