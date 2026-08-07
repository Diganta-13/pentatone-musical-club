INSERT IGNORE INTO roles (name)
VALUES
    ('GENERAL_USER'),
    ('MEMBER'),
    ('ADMIN');

INSERT IGNORE INTO departments (name, short_name)
VALUES
    ('Computer Science and Engineering', 'CSE'),
    ('Electrical and Electronic Engineering', 'EEE'),
    ('Civil Engineering', 'CE');