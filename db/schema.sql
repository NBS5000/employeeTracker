DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fname (30) NOT NULL,
    lname (30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id),
    REFERENCES role(id),
    FOREIGN KEY (manager_id),
    REFERENCES employee(id),
    ON DELETE SET NULL
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary INT NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id),
    REFERENCES department(id)
);

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);
