const inquirer = require('inquirer');
const util = require('util');
require('dotenv').config();

const db = require("./db/conn.js");
let staffList, roleList, deptList, searchList;
let cancel = false;
const Table = require('easy-table');
const { json } = require('express');



// WHOLE TABLE LIST
async function allStaff (){
    const q = `SELECT concat(e.fname," ",e.lname) as Name, r.title as Role, concat(m.fname," ",m.lname) as Manager
                FROM role as r
                LEFT JOIN employee as e on e.role_id = r.id
                LEFT JOIN employee as m on e.manager_id = m.id`;
    [rows,fields] = await db.promise().query(q);
    staffList = rows;
    return staffList;
};
async function justNameStaff(){
    const q = `SELECT concat(e.fname," ",e.lname) as Name 
                FROM employee as e`;
    [rows,fields] = await db.promise().query(q);
    staffList = rows;
    return staffList;
};

async function allRoles (){

    const q = `SELECT r.title as Title, concat("$",r.salary) as Salary, d.name as Department
                FROM role as r
                INNER JOIN department as d ON r.department_id = d.id`;
    [rows,fields] = await db.promise().query(q);
    roleList = rows;
    return roleList;
};

async function allDept (){

    const q = `SELECT name as Department, concat("$",budget) as budget
                FROM department`;
    [rows,fields] = await db.promise().query(q);

    deptList = rows;
    return deptList;
};




///////////////////////////////////////


////////// Specific searches /////////////
async function empNoMan(){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee
                WHERE manager_id IS NULL`;
    
    [rows,fields] = await db.promise().query(q);

    searchList = rows;
    return searchList;
}
async function empNoDep(){
    const q = `SELECT title as Role 
                FROM role
                WHERE department_id IS NULL`;
    
    [rows,fields] = await db.promise().query(q);

    searchList = rows;
    return searchList;
}
async function empNoRole(){
    const q = `SELECT concat(fname," ",lname) as Name 
                FROM employee
                WHERE role_id IS NULL`;
    
    [rows,fields] = await db.promise().query(q);

    searchList = rows;
    return searchList;
}

async function managerTeam(id){
    const q = `SELECT concat(m.fname," ",m.lname) as Name 
    FROM employee as e
    WHERE e.manager_id = ?`;

[rows,fields] = await db.promise().query(q);

searchList = rows;
return searchList;
}
async function allManagers(){
    const q = `SELECT DISTINCT concat(m.fname," ",m.lname) as Name 
                FROM employee as e
                INNER JOIN employee as m ON e.manager_id = m.id
                WHERE e.manager_id IS NOT NULL`;
    
    [rows,fields] = await db.promise().query(q);

    searchList = rows;
    return searchList;
}


///////////////// Stuff /////////////////////////////
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


function deleteStuff(){
    return inquirer.prompt([
        {
            type: "list",
            message: "What would you like to delete?",
            choices: [
                "An Employee",
                "A Role",
                "A Department",
                "Cancel",
            ],
            name: 'toDel',
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
                new inquirer.Separator(),
                "Employees by Dept",
                "Employees by Role",
                "Employees by Manager",
                new inquirer.Separator(),
                "Department Budgets",
                new inquirer.Separator(),
                "Employees - No Manager",
                "Employees - No Role",
                "Roles - No Department",
                new inquirer.Separator(),
                "Cancel",
                new inquirer.Separator(),
            ],
            name: 'toView',
        },
    ])
}

//////////////////////////////////////


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
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ///////////////// Add something ////////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        const add = await addStuff();
        let loop, len;


        if(add.toAdd == "Cancel"){
            return;
        }else if(add.toAdd == "Employee"){
            const manList = await justNameStaff();

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
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ///////////////// View something ///////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////




        let view = await viewStuff();

        if(view.toView == "Cancel"){
            return;
        }else if(view.toView == "All Employees"){
            let x = await allStaff();
            console.table(x);
        }else if(view.toView == "All Departments"){
            let x = await allDept();
            console.table(x);
        }else if(view.toView == "All Roles"){
            let x = await allRoles();
            console.table(x);
        }else if(view.toView == "Employees by Dept"){
            let x = await empByDept();
            console.table(x);
        }else if(view.toView == "Employees by Role"){
            let x = await empByRole();
            console.table(x);
        }else if(view.toView == "Employees by Manager"){
            const x = await allManagers();

            
            len = x.length;
            loop = 0;
            let arr = [];
            while(loop < len){
                arr.push(x[loop].Name);
                loop++;
            };

            const selectMan = await inquirer.prompt([
                {
                    type: "list",
                    name: "man",
                    message: "Which manager would you like to view?",
                    choices: arr,
                },

            ]);

            [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectMan.man );
            const manId = parseInt(rows[0].id);
            [rows,fields] = await db.promise().query(`SELECT concat(fname," ",lname) as Name FROM employee WHERE manager_id = ?`,manId);
            console.info("\n\x1b[32m",selectMan.man, "Team\x1b[0m",)
            console.table(rows);
        




        }else if(view.toView == "Department Budgets"){
            let x = await depBudgets();
            console.table(x);
        }else if(view.toView == "Employees - No Manager"){
            let x = await empNoMan();
            if(x.length == 0) {
                console.log("Currently there are no employees without a manager\n");
            }else{
                console.table(x);
            }
        }else if(view.toView == "Roles - No Department"){
            let x = await empNoDep();
            if(x.length == 0) {
                console.log("Currently there are no roles without a department\n");
            }else{
                console.table(x);
            }
        }else if(view.toView == "Employees - No Role"){
            let x = await empNoRole();
            if(x.length == 0) {
                console.log("Currently there are no employees without a role\n");
            }else{
                console.table(x);
            }
        }
        return;







    }else if(todo.todo == "Update something"){
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ///////////////// Update something /////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        let update = await updateStuff();

        if(update.toUpdate == "Cancel"){
            return;
        }else if(update.toUpdate == "Employee"){
            const updEmpList = await justNameStaff();

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
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${selectEmp.emp}'s\x1b[0m role to ${answers.uprole}?`;},
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
                    
                    try{
                        await db.promise().query("UPDATE employee SET role_id = ? WHERE id = ?",[newRoleId,empUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;

            }else if(selectEmp.empUp == "Their manager"){

                const upMan = await inquirer.prompt([
                    {
                        type: "list",
                        name: "man",
                        message: "Who would you like to change \x1b[35m${selectEmp.emp}'s\x1b[0m manager to?",
                        choices: empArr,
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${selectEmp.emp}'s\x1b[0m manager to ${answers.man}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ])

                if(upMan.conf == "no" || upMan.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectEmp.emp );
                    let empUpId = parseInt(rows[0].id);

                    [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,upMan.man );
                    let manUpId = parseInt(rows[0].id);
                    
                    try{
                        await db.promise().query("UPDATE employee SET manager_id = ? WHERE id = ?",[manUpId,empUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;
            }
        }else if(update.toUpdate == "Department"){

            const dList = await allDept();

            len = dList.length;
            loop = 0;
            let eArr = [];
            while(loop < len){
                eArr.push(dList[loop].name);
                loop++;
            };
            const upDept = await inquirer.prompt([
                {
                    type: "list",
                    name: "dep",
                    message: "Which department would you like to update?",
                    choices: eArr,
                },
                {
                    type: "list",
                    name: "select",
                    message(answers) { return `What would you like to update about \x1b[35m${answers.dep}\x1b[0m?`;},
                    choices: [
                        "Name",
                        "Budget",
                        "Cancel",
                    ],
                },
            ]);


            if(upDept.select == "Cancel"){
                return;
            }else if(upDept.select == "Budget"){
                const upDBud = await inquirer.prompt([
                    {
                        type: "input",
                        name: "bud",
                        message: `What would you like to update ${upDept.dep}'s budget to?`,
                        validate(answer) {
                            if(isNaN(answer)){
                                return "Enter a number, with no letters or other characters";
            
                            }else if(!answer) {
                                return "Their new budget, what is it?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${upDept.dep}\x1b[0m's budget to ${answers.bud}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upDBud.conf == "no" || upDBud.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM department WHERE name LIKE ?`,upDept.dep);
                    let depUpId = parseInt(rows[0].id);
                    let upNewBud = upDBud.bud;
                    try{
                        await db.promise().query("UPDATE department SET budget = ? WHERE id = ?",[upNewBud,depUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
            }else if(upDept.select == "Name"){
                const upDName = await inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: `What would you like to update ${upDept.dep}'s name to?`,
                        validate(answer) {
                            if(!answer) {
                                return "What is their new name?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${upDept.dep}\x1b[0m's name to ${answers.name}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upDName.conf == "no" || upDName.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM department WHERE name LIKE ?`,upDept.dep);
                    let depUpId = parseInt(rows[0].id);
                    let upNewName = upDName.name;
                    try{
                        await db.promise().query("UPDATE department SET name = ? WHERE id = ?",[upNewName,depUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }

                return;
            }
        }else if(update.toUpdate == "Role"){
            const rList = await allRoles();
            
            len = rList.length;
            loop = 0;
            let rArr = [];
            while(loop < len){
                rArr.push(rList[loop].Title);
                loop++;
            };
            const upRole = await inquirer.prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Which role would you like to update?",
                    choices: rArr,
                },
                {
                    type: "list",
                    name: "select",
                    message(answers) { return `What would you like to update about the \x1b[35m${answers.role}\x1b[0m role?`;},
                    choices: [
                        "Title",
                        "Salary",
                        "Department",
                        "Cancel",
                    ],
                },
            ]);


            if(upRole.select == "Cancel"){
                return;
            }else if(upRole.select == "Salary"){
                const upRSal = await inquirer.prompt([
                    {
                        type: "input",
                        name: "sal",
                        message: `What would you like to update ${upRole.role}'s salary to?`,
                        validate(answer) {
                            if(isNaN(answer)){
                                return "Enter a number, with no letters or other characters";
            
                            }else if(!answer) {
                                return "Their new salary, what is it?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${upRole.role}'s\x1b[0m salary to ${answers.sal}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upRSal.conf == "no" || upRSal.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM role WHERE title LIKE ?`,upRole.role);
                    let roleUpId = parseInt(rows[0].id);
                    let upNewSal = parseInt(upRSal.sal);
                    try{
                        await db.promise().query("UPDATE role SET salary = ? WHERE id = ?",[upNewSal,roleUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
            }else if(upRole.select == "Title"){
                const upRTitle = await inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: `What would you like to update ${upRole.role}'s title to?`,
                        validate(answer) {
                            if(!answer) {
                                return "What is the new title?"
                            }
                            return true
                        }
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Update \x1b[35m${upRole.role}\x1b[0m's name to ${answers.name}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upRTitle.conf == "no" || upRTitle.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM role WHERE title LIKE ?`,upRole.role);
                    let roleUpId = parseInt(rows[0].id);
                    let upNewName = upRTitle.name;
                    try{
                        await db.promise().query("UPDATE role SET title = ? WHERE id = ?",[upNewName,roleUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;
            }else if(upRole.select == "Department"){

                const dList = await allDept();

                len = dList.length;
                loop = 0;
                let dArr = [];
                while(loop < len){
                    dArr.push(dList[loop].name);
                    loop++;
                };
                const upRoleDept = await inquirer.prompt([
                    {
                        type: "list",
                        name: "dep",
                        message: `Which department would you like to move the role of ${upRole.role} to?`,
                        choices: dArr,
                    },
                    {
                        type: "confirm",
                        name: "conf",
                        message(answers) { return `\x1b[35mConfirm:\x1b[0m Move \x1b[35m${upRole.role}\x1b[0m to ${answers.dep}?`;},
                        validate(answer) {
                            if(!answer) {
                                return "Yes or no?"
                            }
                            return true
                        }
                    }
                ]);
                if(upRoleDept.conf == "no" || upRoleDept.conf === false){
                    console.log(`\x1b[31mNot\x1b[0m updated\n`)
                }else{
                    [rows,fields] = await db.promise().query(`SELECT id FROM role WHERE title LIKE ?`,upRole.role);
                    let roleUpId = parseInt(rows[0].id);
                    [rows,fields] = await db.promise().query(`SELECT id FROM department WHERE name LIKE ?`,upRoleDept.dep);
                    let newRoleDept = parseInt(rows[0].id);
                    try{
                        await db.promise().query("UPDATE role SET department_id = ? WHERE id = ?",[newRoleDept,roleUpId])
                        console.log(`\x1b[32mSuccessfully\x1b[0m updated\n`)
                    }catch(err){
                        console.log(`\x1b[31mNot\x1b[0m updated: ${err}\n`)
                    }

                }
                return;
            }

        }


    }else if(todo.todo == "Delete something"){
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ///////////////// Delete something /////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////

        
        let del = await deleteStuff();

        if(del.toDel == "Cancel"){
            return;
        }else if(del.toDel == "An Employee"){
            const delEmpList = await justNameStaff();

            len = delEmpList.length;
            loop = 0;
            let empArr = [];
            while(loop < len){
                empArr.push(delEmpList[loop].Name);
                loop++;
            };

            const selectEmp = await inquirer.prompt([
                {
                    type: "list",
                    name: "emp",
                    message: "Who would you like to remove from the system?",
                    choices: empArr,
                },
                {
                    type: "confirm",
                    name: "conf",
                    message(answers) { return `\x1b[35mConfirm:\x1b[0m Delete \x1b[35m${answers.emp}\x1b[0m from the system?\n\x1b[41m\x1b[33mThis is permanent and cannot be undone\x1b[0m`;},
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                }
            ]);


            if(selectEmp.conf == "no" || selectEmp.conf === false){
                console.log(`${selectEmp.emp} \x1b[31mnot\x1b[0m deleted\n`)
            }else{
                [rows,fields] = await db.promise().query(`SELECT id FROM employee WHERE concat(fname," ",lname) LIKE ?`,selectEmp.emp );
                let empDelId = parseInt(rows[0].id);
                
                try{
                    await db.promise().query("DELETE FROM employee WHERE id = ?",[empDelId])
                    console.log(`${selectEmp.emp} \x1b[32msuccessfully\x1b[0m deleted\n`)
                }catch(err){
                    console.log(`${selectEmp.emp} \x1b[31mnot\x1b[0m deleted: ${err}\n`)
                }

                
                return;

            }
        }else if(del.toDel == "A Department"){
            const delDepList = await allDept();

            len = delDepList.length;
            loop = 0;
            let depArr = [];
            while(loop < len){
                depArr.push(delDepList[loop].Department);
                loop++;
            };

            const selectDep = await inquirer.prompt([
                {
                    type: "list",
                    name: "dep",
                    message: "Which department would you like to remove from the system?",
                    choices: depArr,
                },
                {
                    type: "confirm",
                    name: "conf",
                    message(answers) { return `\x1b[35mConfirm:\x1b[0m Delete \x1b[35m${answers.dep}\x1b[0m from the system?\n\x1b[41m\x1b[33mThis is permanent and cannot be undone\x1b[0m`;},
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                }
            ]);


            if(selectDep.conf == "no" || selectDep.conf === false){
                console.log(`${selectDep.dep} \x1b[31mnot\x1b[0m deleted\n`)
            }else{
                [rows,fields] = await db.promise().query(`SELECT id FROM department WHERE name LIKE ?`,selectDep.dep );
                let depDelId = parseInt(rows[0].id);
                
                try{
                    await db.promise().query("DELETE FROM department WHERE id = ?",[depDelId])
                    console.log(`${selectDep.dep} \x1b[32msuccessfully\x1b[0m deleted\n`)
                }catch(err){
                    console.log(`${selectDep.dep} \x1b[31mnot\x1b[0m deleted: ${err}\n`)
                }

                
                return;

            }
        }else if(del.toDel == "A Role"){
            const delRoleList = await allRoles();

            len = delRoleList.length;
            loop = 0;
            let roleArr = [];
            while(loop < len){
                roleArr.push(delRoleList[loop].Title);
                loop++;
            };

            const selectRole = await inquirer.prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Which role would you like to remove from the system?",
                    choices: roleArr,
                },
                {
                    type: "confirm",
                    name: "conf",
                    message(answers) { return `\x1b[35mConfirm:\x1b[0m Delete \x1b[35m${answers.dep}\x1b[0m from the system?\n\x1b[41m\x1b[33mThis is permanent and cannot be undone\x1b[0m`;},
                    validate(answer) {
                        if(!answer) {
                            return "Yes or no?"
                        }
                        return true
                    }
                }
            ]);


            if(selectRole.conf == "no" || selectRole.conf === false){
                console.log(`${selectRole.role} \x1b[31mnot\x1b[0m deleted\n`)
            }else{
                [rows,fields] = await db.promise().query(`SELECT id FROM role WHERE title LIKE ?`,selectRole.role );
                let roleDelId = parseInt(rows[0].id);
                try{
                    await db.promise().query("DELETE FROM role WHERE id = ?",[roleDelId])
                    console.log(`${selectRole.role} \x1b[32msuccessfully\x1b[0m deleted\n`)
                }catch(err){
                    console.log(`${selectRole.role} \x1b[31mnot\x1b[0m deleted: ${err}\n`)
                }

                
                return;

            }
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