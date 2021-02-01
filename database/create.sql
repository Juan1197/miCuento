CREATE DATABASE prueba_micuento;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    dueDate DATE,
    createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updatedAt TIMESTAMP NOT NULL DEFAULT current_timestamp,
    priority INT
);


CREATE OR REPLACE FUNCTION updateTaskDate() RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt := NOW();
    RETURN NEW;
END; 
$$
LANGUAGE plpgsql;

CREATE TRIGGER triggerUpdateLastUpdate
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE updateTaskDate();