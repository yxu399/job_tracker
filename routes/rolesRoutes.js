// -- --------------------------------------------------------------------
// -- Citation for the following file:
// -- Date: 08/04/2024
// -- Adapted from OSU-CS340-ecampus nodejs-starter-app files
// -- Templates updated for the subject database.
// -- Modified to include additional functionality, styling, and forms.
// -- Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app
// -- --------------------------------------------------------------------

// rolesRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

// GET route to display all roles
router.get('/', function(req, res) {
    let query1;
    let queryParams = [];

    if (req.query.role === undefined) {
        query1 = `SELECT * FROM Roles;`;
    } else {
        query1 = `SELECT * FROM Roles WHERE role LIKE ?;`;
        queryParams.push(`%${req.query.role}%`);
    }

    db.pool.query(query1, queryParams, function(error, roles, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        res.render('roles', { data: roles });
    });
});

// ------------------------------------------------------------------------------------------

// POST route to add a new role
router.post('/add-role-ajax', function(req, res) {
    let data = req.body;
    console.log('Received data:', data);

    const query1 = `INSERT INTO Roles (role) VALUES (?)`;
    const values = [data.role];

    db.pool.query(query1, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding role', details: error.message });
        } else {
            const fetchQuery = `SELECT * FROM Roles WHERE idRole = ?`;

            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new role:', fetchError);
                    res.status(500).json({ error: 'Error fetching new role', details: fetchError.message });
                } else {
                    res.json(fetchResult);
                }
            });
        }
    });
});


module.exports = router;