// server-side script: skillsRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res) {
    let query1;
    let queryParams = [];

    if (req.query.skillName === undefined) {
        query1 = `SELECT * FROM Skills;`;
    } else {
        query1 = `SELECT * FROM Skills WHERE skillName LIKE ?;`;
        queryParams.push(`%${req.query.skillName}%`);
    }

    db.pool.query(query1, queryParams, function(error, skills, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        skills = skills.map(skill => {
            skill.haveSkill = skill.haveSkill ? 'Yes' : 'No';
            return skill;
        });

        console.log("Skills results:", skills);
        
        res.render('skills', {
            data: skills,
            searchTerm: req.query.skillName || ''
        });
    });
});

router.post('/add-skill-ajax', function(req, res) {
    let data = req.body;
    console.log('Received data:', data);

    let query1 = `INSERT INTO Skills (skillName, skillType, haveSkill, userProficiency, description) 
                  VALUES (?, ?, ?, ?, ?)`;

    const values = [
        data.skillName,
        data.skillType,
        data.haveSkill === 'true' || data.haveSkill === '1' ? 1 : 0,
        data.userProficiency || null,
        data.description || null
    ];

    console.log('Query:', query1);
    console.log('Values:', values);
    
    db.pool.query(query1, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding skill', details: error.message });
        } else {
            const fetchQuery = `SELECT * FROM Skills WHERE idSkill = ?`;

            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new skill:', fetchError);
                    res.status(500).json({ error: 'Error fetching new skill', details: fetchError.message });
                } else {
                    const formattedResult = fetchResult.map(skill => {
                        skill.haveSkill = skill.haveSkill ? 'Yes' : 'No';
                        return skill;
                    });
                    console.log('Fetched result:', formattedResult); 
                    res.json(formattedResult);
                }
            });
        }
    });
});

// router.delete('/delete-skill/:id', (req, res) => {
//     console.log("Received DELETE request for skill ID:", req.params.id);
//     const skillId = parseInt(req.params.id);

//     if (isNaN(skillId)) {
//         console.error("Invalid skill ID:", req.params.id);
//         return res.status(400).json({ error: "Invalid skill ID." });
//     }

//     const deleteSkill = 'DELETE FROM Skills WHERE idSkill = ?';

//     db.pool.query(deleteSkill, [skillId], (error, result) => {
//         if (error) {
//             console.error("Database error:", error);
//             return res.status(500).json({ error: "An error occurred while deleting the skill.", details: error.message });
//         }

//         if (result.affectedRows === 0) {
//             console.warn("Skill not found:", skillId);
//             return res.status(404).json({ error: "Skill not found." });
//         }

//         console.log("Skill deleted successfully:", skillId);
//         res.status(200).json({ message: "Skill deleted successfully." });
//     });
// });

router.put('/put-skill-ajax', function(req, res, next) {
    let data = req.body;
    console.log("Received PUT request with data:", JSON.stringify(data, null, 2));

    let updateFields = [];
    let values = [];
    let query = 'UPDATE Skills SET ';

    const fields = [
        'skillName', 
        'skillType', 
        'haveSkill', 
        'userProficiency', 
        'description'
    ];

    fields.forEach(field => {
        if (data[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            if (field === 'haveSkill') {
                values.push(data[field] === 'true' || data[field] === '1' ? 1 : 0);
            } else {
                values.push(data[field]);
            }
        }
    });

    query += updateFields.join(', ') + ' WHERE idSkill = ?';
    values.push(data.idSkill);

    console.log("Prepared query:", query);
    console.log("Prepared values:", values);

    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error("Database error during update:", error);
            return res.status(500).json({ error: "Database error during update", details: error.message });
        }

        console.log("Update query result:", result);

        if (result.affectedRows === 0) {
            console.warn("No rows were updated. Skill might not exist.");
            return res.status(404).json({ error: "Skill not found or no changes made" });
        }

        let selectQuery = `SELECT * FROM Skills WHERE idSkill = ?`;
        
        db.pool.query(selectQuery, [data.idSkill], function(selectError, rows) {
            if (selectError) {
                console.error("Error fetching updated skill:", selectError);
                return res.status(500).json({ error: "Error fetching updated skill", details: selectError.message });
            }
        
            if (rows.length === 0) {
                console.warn("Updated skill not found in database");
                return res.status(404).json({ error: "Updated skill not found" });
            }    

            const formattedRow = {...rows[0]};
            formattedRow.haveSkill = formattedRow.haveSkill ? 'Yes' : 'No';

            console.log("Sending back updated skill:", JSON.stringify(formattedRow, null, 2));
            return res.json(formattedRow);
        });
    });
});

module.exports = router;