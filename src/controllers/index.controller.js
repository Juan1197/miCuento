const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'testpassword',
    database: 'prueba_micuento',
    port: '5432'
});

const getTasks = async (req, res) => {
    const sort = req.params.sort ? req.params.sort.toLowerCase() : "";
    const type = req.params.type ? req.params.type.toLowerCase() : "";

    if (type.length && !(type != "pending" || type != "overdue")) {
        res.status(500).json({
            "status": 500,
            "errors": "valid type values: pending and overdue"
        });
        return;
    }

    if (sort.length && !(sort != "id" || sort != "name" || sort != "duedate" || sort != "createdat" || sort != "updatedat" || sort != "priority")) {
        res.status(500).json({
            "status": 500,
            "errors": "valid sort values: id, name, duedate, createdat, updatedat and priority"
        });
        return;
    }

    var sql = "SELECT * FROM tasks ";

    if (type == "pending") {
        sql = sql + "WHERE dueDate > NOW()";
    } else {
        sql = sql + "WHERE dueDate <= NOW()";
    }

    if (sort) {
        sql = sql + "ORDER BY " + sort;
    }

    const response = await pool.query(sql);

    res.status(200).json(response.rows);
};

// const getTaskById = async (req, res) => {
//     const id = parseInt(req.params.id);
//     const response = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
//     res.json(response.rows);
// };

const createTask = async (req, res) => {
    const { name, dueDate, priority } = req.body;
    checkParameters(name, dueDate, priority, res);

    const response = await pool.query('INSERT INTO tasks (name, dueDate, priority) VALUES ($1, $2, $3)', [name, dueDate, priority]);
    res.json({
        "name": name,
        "dueDate": dueDate,
        "priority": priority
    })
};

const updateTask = async (req, res) => {
    const { name, dueDate, priority, id } = req.body;
    
    if (!id || typeof id != "number") {
        res.status(400).json({
            "status": 400,
            "errors": "Error, not id provided"
        });
        return;
    }

    checkParameters(name, dueDate, priority, res);

    const response = await pool.query('UPDATE tasks SET name = $1, dueDate = $2, priority = $3 WHERE id = $4', [
        name,
        dueDate,
        priority,
        id
    ]);

    if (!response.rowCount) {
        res.status(404).json({
            "status": 404,
            "errors": "Error, not valid id provided"
        });
        return;
    }

    res.json({
        "name": name,
        "dueDate": dueDate,
        "priority": priority,
        "id": id
    })
};

const deleteTask = async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        res.status(400).json({
            "status": 400,
            "errors": "Error, not id provided"
        });
        return;
    }

    const response = await pool.query('DELETE FROM tasks where id = $1', [
        id
    ]);

    if (!response.rowCount) {
        res.status(404).json({
            "status": 404,
            "errors": "Error, not valid id provided"
        });
        return;
    }

    res.json(`Task ${id} deleted Successfully`);
};

function checkParameters(name, dueDate, priority, res) {
    var errores = {
        "ValidationError": {
            "name": [],
            "dueDate": [],
            "priority": []
        }
    };
    var errorFlag = false;

    if (typeof name != 'string') {
        errores["ValidationError"]["name"].push({
            "data": name,
            "message": "Validation error: \"null\" is not of type \"string\"",
            "rule": "string"
        });
        errorFlag = true;
    }

    if (!name) {
        errores["ValidationError"]["name"].push({
            "data": name,
            "message": "Validation error: \"null\" Rule \"required(true)\" failed.",
            "rule": "required",
            "args": [true]
        });
        errorFlag = true;
    }

    var parsedDate = Date.parse(dueDate);
    if (isNaN(parsedDate)) {
        errores["ValidationError"]["dueDate"].push({
            "data": dueDate,
            "message": "Validation error: \"null\" is not of type \"date\"",
            "rule": "date"
        });
        errorFlag = true;
    }

    if (!dueDate) {
        errores["ValidationError"]["dueDate"].push({
            "data": dueDate,
            "message": "Validation error: \"null\" Rule \"required(true)\" failed.",
            "rule": "required",
            "args": [true]
        });
        errorFlag = true;
    }

    if (typeof priority != "number") {
        errores["ValidationError"]["priority"].push({
            "data": priority,
            "message": "Validation error: \"null\" is not of type \"number\"",
            "rule": "date"
        });
        errorFlag = true;
    }

    if (!priority) {
        errores["ValidationError"]["priority"].push({
            "data": priority,
            "message": "Validation error: \"null\" Rule \"required(true)\" failed.",
            "rule": "required",
            "args": [true]
        });
        errorFlag = true;
    }

    if (priority < 1 || priority > 5) {
        errores["ValidationError"]["priority"].push({
            "data": priority,
            "message": "Validation error: \"24\" Rule \"in(1,2,3,4,5)\" failed",
            "rule": "in",
            "args": [
                1,
                2,
                3,
                4,
                5
            ]
        });
        errorFlag = true;
    }

    if (errorFlag) {
        res.status(500).json({
            "status": 500,
            "errors": errores
        });
        return;
    }
}

module.exports = {
    getTasks,
    // getTaskById,
    createTask,
    updateTask,
    deleteTask
};