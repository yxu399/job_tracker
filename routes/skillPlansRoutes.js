// server-side script: skillPlansRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res) {
    // Declare Query 1
    let query1;
    let queryParams = [];

    if (req.query.description === undefined) {
        query1 = `
            SELECT sp.idPlan, 
            s.skillName,
            sp.description, sp.source, sp.startDate, sp.endDate, sp.cost, sp.note 
            FROM SkillPlans sp
            LEFT JOIN Skills s ON sp.idSkill = s.idSkill;
        `;
    } else {
        query1 = `
            SELECT sp.idPlan, 
            s.skillName,
            sp.description, sp.source, sp.startDate, sp.endDate, sp.cost, sp.note 
            FROM SkillPlans sp
            LEFT JOIN Skills s ON sp.idSkill = s.idSkill
            WHERE sp.description LIKE ?;
        `;
        queryParams.push(`%${req.query.description}%`);
    }

    // Query 2 to get all skills 
    let query2 = "SELECT * FROM Skills;";

    // Run the 1st query
    db.pool.query(query1, queryParams, function(error, skillPlans, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        skillPlans = skillPlans.map(plan => {
            plan.startDate = formatDateToDisplay(plan.startDate);
            plan.endDate = formatDateToDisplay(plan.endDate);
            return plan;
        });

        console.log("Skill Plans results:", skillPlans);
        
        // Run the second query
        db.pool.query(query2, (error, skills, fields) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
            
            res.render('skillPlans', {
                data: skillPlans, 
                skills: skills,
                searchTerm: req.query.description || ''
            });
        });
    });
});

function formatDateToDisplay(dateString) {
    if (!dateString) return ''; // Handle null dates
    const date = new Date(dateString);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// APIs to support the dropdown functionality for skills
// Get all skills
router.get('/get-skills', function(req, res) {
    let query = "SELECT idSkill, skillName FROM Skills;";
    db.pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.json(results);
    });
});

// ------------------------------------------------------------------------------------------

router.post('/add-skill-plan-ajax', function(req, res)
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Log the incoming data for debugging
    console.log('Received data:', data);

    // Capture NULL values
    let idSkill = parseInt(data.idSkill); 
    if (isNaN(idSkill)) {
        console.log('Invalid idSkill:', data.idSkill);
        return res.status(400).send('Invalid Skill ID');
    }

    let cost = data.cost && data.cost.trim() !== '' ? parseFloat(data.cost) : null;

    // Create the query and run it on the database
    query1 = `INSERT INTO SkillPlans (idSkill, description, source, 
    startDate, endDate, cost, note) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Prepare values array
    const values = [
        data.idSkill,
        data.description,
        data.source,
        adjustDateForStorage(data.startDate),
        adjustDateForStorage(data.endDate),
        cost,
        data.note
    ];

    // Log the query and values for debugging purpose
    console.log('Query:', query1);
    console.log('Values:', values);
    
    db.pool.query(query1, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding skill plan', details: error.message });
        } else {
            // Fetch the newly inserted row
            const fetchQuery = `
                SELECT sp.*, s.skillName 
                FROM SkillPlans sp 
                LEFT JOIN Skills s ON sp.idSkill = s.idSkill 
                WHERE sp.idPlan = ?`;

            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new skill plan:', fetchError);
                    res.status(500).json({ error: 'Error fetching new skill plan', details: fetchError.message });
                } else {
                    const formattedResult = fetchResult.map(plan => {
                        plan.startDate = formatDateToDisplay(plan.startDate);
                        plan.endDate = formatDateToDisplay(plan.endDate);
                        return plan;
                    });
                    console.log('Fetched result:', formattedResult); 
                    res.json(formattedResult);
                }
            });
        }
    });
});

// ------------------------------------------------------------------------------------------

router.delete('/delete-skill-plan/:id', (req, res) => {
    console.log("Received DELETE request for skill plan ID:", req.params.id);  // Debugging log
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
        console.error("Invalid skill plan ID:", req.params.id);
        return res.status(400).json({ error: "Invalid skill plan ID." });
    }

    const deleteSkillPlan = 'DELETE FROM SkillPlans WHERE idPlan = ?';

    db.pool.query(deleteSkillPlan, [planId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "An error occurred while deleting the skill plan.", details: error.message });
        }

        if (result.affectedRows === 0) {
            console.warn("Skill plan not found:", planId);
            return res.status(404).json({ error: "Skill plan not found." });
        }

        console.log("Skill plan deleted successfully:", planId);
        res.status(200).json({ message: "Skill plan deleted successfully." });
    });
});

// ------------------------------------------------------------------------------------------

router.put('/put-skill-plan-ajax', function(req, res, next) {
    let data = req.body;
    console.log("Received PUT request with data:", JSON.stringify(data, null, 2));

    // Ensure that if date fields are empty, they are set to null
    const dateFields = ['startDate', 'endDate'];
    dateFields.forEach(field => {
        if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null; // Set blank dates to NULL
        } else if (data[field] && !isValidDate(data[field])) {
            return res.status(400).json({ error: `Invalid date format for ${field}. Expected YYYY-MM-DD.` });
        } else {
            data[field] = adjustDateForStorage(data[field]);
        }
});

    let updateFields = [];
    let values = [];
    let query = 'UPDATE SkillPlans SET ';

    const fields = [
        'idSkill', 
        'description', 
        'source', 
        'startDate', 
        'endDate',  
        'cost', 
        'note'
    ];

    fields.forEach(field => {
        if (data[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            values.push(data[field]);
        }
    });

    query += updateFields.join(', ') + ' WHERE idPlan = ?';
    values.push(data.idPlan);

    console.log("Prepared query:", query);
    console.log("Prepared values:", values);

    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error("Database error during update:", error);
            return res.status(500).json({ error: "Database error during update", details: error.message });
        }

        console.log("Update query result:", result);

        if (result.affectedRows === 0) {
            console.warn("No rows were updated. Skill plan might not exist.");
            return res.status(404).json({ error: "Skill plan not found or no changes made" });
        }

        let selectQuery = `
            SELECT sp.*, s.skillName 
            FROM SkillPlans sp
            LEFT JOIN Skills s ON sp.idSkill = s.idSkill
            WHERE sp.idPlan = ?`;

        db.pool.query(selectQuery, [data.idPlan], function(selectError, rows) {
            if (selectError) {
                console.error("Error fetching updated skill plan:", selectError);
                return res.status(500).json({ error: "Error fetching updated skill plan", details: selectError.message });
            }

            if (rows.length === 0) {
                console.warn("Updated skill plan not found in database");
                return res.status(404).json({ error: "Updated skill plan not found" });
            }

            const formattedRow = {...rows[0]};
            formattedRow.startDate = formattedRow.startDate ? new Date(formattedRow.startDate).toISOString().split('T')[0] : '';
            formattedRow.endDate = formattedRow.endDate ? new Date(formattedRow.endDate).toISOString().split('T')[0] : '';

            console.log("Sending back updated skill plan:", JSON.stringify(formattedRow, null, 2));
            return res.json(formattedRow);
        });
    });
});


function adjustDateForStorage(dateString) {
    if (!dateString) return null; // Handle null dates
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toISOString().split('T')[0];
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString + 'T00:00:00');
    return date instanceof Date && !isNaN(date);
}

module.exports = router;
