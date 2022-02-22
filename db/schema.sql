DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    budget INT
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary INT NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(30) NOT NULL,
    lname VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    FOREIGN KEY (role_id)
    REFERENCES role(id),
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);



INSERT INTO department (name, budget)
    VALUES ("Management",1000000),
        ("Human Resources",200000),
        ("Development",350000),
        ("Testing",175000),
        ("Media",100000);

INSERT INTO role (title, department_id, salary)
    VALUES ("CEO", 1, 250000),
        ("Director", 1,150000),
        ("Office Manager", 1, 80000),
        ("HR Team Leader", 2, 60000),
        ("Dev Team Leader", 3,65000),
        ("Testing Team Leader", 4, 65000),
        ("Media Team Leader", 5, 60000),
        ("HR Officer", 2, 45000),
        ("Developer", 3,50000),
        ("Tester", 4,50000),
        ("Media Officer", 5,45000);

INSERT INTO employee (fname, lname,role_id,manager_id)
    VALUES ("Sheev","Palpatine",1,null),
        ("Darth","Vader",2, 1),
        -- office managers
        ("Grand Moff","Tarkin",3, 2),
        ("Mon","Mothma",3, 2),
        ("Grand Admiral","Thrawn",3, 2),
        -- hr
        ("General","Hux", 4,3),
        ("Captain","Phasma",8, 6),
        ("Supreme Leader","Snoke",8, 6),
        -- dev1
        ("Master","Yoda",5, 4),
        ("Obi Wan","Kenobi",5, 9),
        ("Kit","Fisto",5, 9),
        -- dev2
        ("Anakin","Skywalker",5, 5),
        ("Ashoka","Tano",5, 12),
        ("Commander","Cody",5, 12),
        -- testing
        ("Rey","Skywalker",6, 3),
        ("Kylo","Ren",10, 12),
        ("FN2187","Finn",10, 12),
        -- media
        ("Boba","Fett", 7,4),
        ("Cad","Bane",11 ,18);



        --select concat(e.fname," ",e.lname) as Name, concat(m.fname," ",m.lname) as Manager from employee as m inner join employee as e on e.manager_id = m.id inner join role as r on e.role_id = r.id inner join department as d on r.department_id = d.id where d.name = "Media";