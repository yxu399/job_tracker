// server-side script: postingsSkillsRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res) {
    console.log("GET / route hit");
    console.log("Search term:", req.query.search);

    let baseQuery = `
        SELECT ps.idPostingSkill, jp.jobTitle, s.skillName, ps.requiredProficiency
        FROM PostingsSkills ps
        JOIN JobPostings jp ON ps.idPosting = jp.idPosting
        JOIN Skills s ON ps.idSkill = s.idSkill
    `;

    let whereClause = '';
    let queryParams = [];

    if (req.query.search) {
        console.log("Search term detected, modifying query");
        whereClause = ' WHERE jp.jobTitle LIKE ? OR s.skillName LIKE ?';
        queryParams = [`%${req.query.search}%`, `%${req.query.search}%`];
    }

    let query1 = baseQuery + whereClause;
    console.log("Final query:", query1);
    console.log("Query parameters:", queryParams);

    let query2 = "SELECT idPosting, jobTitle FROM JobPostings;";
    let query3 = "SELECT idSkill, skillName FROM Skills;";

    db.pool.query(query1, queryParams, function(error, postingsSkills, fields) {
        if (error) {
            console.error("Error in first query:", error);
            res.sendStatus(500);
            return;
        }
        console.log("First query successful. Results:", postingsSkills.length);

        db.pool.query(query2, (error, jobPostings, fields) => {
            if (error) {
                console.error("Error in second query:", error);
                res.sendStatus(500);
                return;
            }
            console.log("Second query successful. Results:", jobPostings.length);
            
            db.pool.query(query3, (error, skills, fields) => {
                if (error) {
                    console.error("Error in third query:", error);
                    res.sendStatus(500);
                    return;
                }
                console.log("Third query successful. Results:", skills.length);
                
                console.log("Rendering postingsSkills view");
                res.render('postingsSkills', {
                    data: postingsSkills, 
                    jobPostings: jobPostings,
                    skills: skills,
                    searchTerm: req.query.search
                });
            });
        });
    });
});

// APIs to support the dropdown functionality for job postings and skills
// Get all job postings
router.get('/get-job-postings', function(req, res) {
    let query = "SELECT idPosting, jobTitle FROM JobPostings;";
    db.pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.json(results);
    });
});

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

// ------------------------------------------------------------------
// Add a new PostingSkill
router.post('/add-posting-skill-ajax', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO PostingsSkills (idPosting, idSkill, requiredProficiency) VALUES (?, ?, ?)`;
    let values = [data.idPosting, data.idSkill, data.requiredProficiency];

    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding posting skill', details: error.message });
        } else {
            // Fetch the newly inserted row
            const fetchQuery = `
                SELECT ps.idPostingSkill, jp.jobTitle, s.skillName, ps.requiredProficiency
                FROM PostingsSkills ps
                JOIN JobPostings jp ON ps.idPosting = jp.idPosting
                JOIN Skills s ON ps.idSkill = s.idSkill
                WHERE ps.idPostingSkill = ?`;

            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new posting skill:', fetchError);
                    res.status(500).json({ error: 'Error fetching new posting skill', details: fetchError.message });
                } else {
                    res.json(fetchResult[0]);
                }
            });
        }
    });
});
// ------------------------------------------------------------------
// Delete a PostingSkill
router.delete('/delete-posting-skill/:id', (req, res) => {
    const postingSkillId = parseInt(req.params.id);

    if (isNaN(postingSkillId)) {
        return res.status(400).json({ error: "Invalid posting skill ID." });
    }

    const deleteQuery = 'DELETE FROM PostingsSkills WHERE idPostingSkill = ?';

    db.pool.query(deleteQuery, [postingSkillId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "An error occurred while deleting the posting skill.", details: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Posting skill not found." });
        }

        res.status(200).json({ message: "Posting skill deleted successfully." });
    });
});
// ------------------------------------------------------------------
// Update a PostingSkill
router.put('/update-posting-skill-ajax', function(req, res) {
    let data = req.body;

    let query = `UPDATE PostingsSkills SET idPosting = ?, idSkill = ?, requiredProficiency = ? WHERE idPostingSkill = ?`;
    let values = [data.idPosting, data.idSkill, data.requiredProficiency, data.idPostingSkill];

    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error("Database error during update:", error);
            return res.status(500).json({ error: "Database error during update", details: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Posting skill not found or no changes made" });
        }

        let selectQuery = `
            SELECT ps.idPostingSkill, jp.jobTitle, s.skillName, ps.requiredProficiency
            FROM PostingsSkills ps
            JOIN JobPostings jp ON ps.idPosting = jp.idPosting
            JOIN Skills s ON ps.idSkill = s.idSkill
            WHERE ps.idPostingSkill = ?`;
        
        db.pool.query(selectQuery, [data.idPostingSkill], function(selectError, rows) {
            if (selectError) {
                console.error("Error fetching updated posting skill:", selectError);
                return res.status(500).json({ error: "Error fetching updated posting skill", details: selectError.message });
            }
        
            if (rows.length === 0) {
                return res.status(404).json({ error: "Updated posting skill not found" });
            }    

            return res.json(rows[0]);
        });
    });
});

module.exports = router;