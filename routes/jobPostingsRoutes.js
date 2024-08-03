
// jobPostingsRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res) {
    // Declare Query 1
    let query1;
    let queryParams = [];

    if (req.query.jobTitle === undefined) {
        query1 = `
            SELECT jp.idPosting, 
            c.companyName,
            r.role, 
            jp.jobTitle, jp.datePosted, jp.dateApplied, jp.status, jp.description, 
            jp.annualSalary, jp.salaryCurrency, jp.location, jp.workMode 
            FROM JobPostings jp
            LEFT JOIN Companies c ON jp.idCompany = c.idCompany
            LEFT JOIN Roles r ON jp.idRole = r.idRole;
        `;
    } else {
        query1 = `
            SELECT jp.idPosting, 
            c.companyName,
            r.role, 
            jp.jobTitle, jp.datePosted, jp.dateApplied, jp.status, jp.description, 
            jp.annualSalary, jp.salaryCurrency, jp.location, jp.workMode 
            FROM JobPostings jp
            LEFT JOIN Companies c ON jp.idCompany = c.idCompany
            LEFT JOIN Roles r ON jp.idRole = r.idRole
            WHERE jp.jobTitle LIKE ?;
        `;
        queryParams.push(`%${req.query.jobTitle}%`);
    }

    // Query 2 to get all companies 
    let query2 = "SELECT * FROM Companies;";

    // Query 3 to get all roles
    let query3 = "SELECT * FROM Roles;";

    // Run the 1st query
    db.pool.query(query1, queryParams, function(error, jobPostings, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        console.log("Job Postings results:", jobPostings);
        
        // Run the second query
        db.pool.query(query2, (error, companies, fields) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
            
            // Run the third query
            db.pool.query(query3, (error, roles, fields) => {
                if (error) {
                    console.log(error);
                    res.sendStatus(500);
                    return;
                }
                
                // // convert date format Month name DD YYY
                // const formatDate = (dateString) => {
                //     const date = new Date(dateString);
                //     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                // };
                
                // // query callback:
                // jobPostings = jobPostings.map(posting => ({
                //     ...posting,
                //     datePosted: formatDate(posting.datePosted),
                //     dateApplied: formatDate(posting.dateApplied)
                // }));
                console.log("Job Postings:", jobPostings);
                res.render('jobPostings', {
                    data: jobPostings, 
                    companies: companies,
                    roles: roles,
                    searchTerm: req.query.jobTitle || ''
                });
            });
        });
    });
});

// ------------------------------------------------------------------------------------------

router.post('/add-job-posting-ajax', function(req, res)
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Log the incoming data for debugging
     console.log('Received data:', data);

    // Capture NULL values
    let idCompany = parseInt(data.idCompany); 
    // Validate required fields
    if (isNaN(idCompany)) 
    {
        console.log('Invalid idCompany:', data['input-idCompany']);
        return res.status(400).send('Invalid Company ID');
    }

    let idRole = parseInt(data.idRole);
    if (isNaN(idRole)) 
    {
        idRole = 'NULL';
    }

    let annualSalary = parseFloat(data.annualSalary) 
    if (isNaN(annualSalary))
    {
        annualSalary = 'NULL'
    }

    // Create the query and run it on the database
    query1 = `INSERT INTO JobPostings (idCompany, idRole, 
    jobTitle, datePosted, dateApplied, status, description, 
    annualSalary, salaryCurrency, location, workMode) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Prepare values array
    const values = [
        data.idCompany,
        data.idRole,
        data.jobTitle,
        data.datePosted,
        data.dateApplied,
        data.status,
        data.description,
        data.annualSalary,
        data.salaryCurrency,
        data.location,
        data.workMode
    ];

    // Log the query and values for debugging purpose
    console.log('Query:', query1);
    console.log('Values:', values);
    
    db.pool.query(query1, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding job posting', details: error.message });
        } else {
            // Fetch the newly inserted row
            const fetchQuery = `SELECT * FROM JobPostings WHERE idPosting = ?`;
            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new job posting:', fetchError);
                    res.status(500).json({ error: 'Error fetching new job posting', details: fetchError.message });
                } else {
                    // Send back the newly inserted row
                    res.json(fetchResult);
                }
            });
        }
    });
});

// ------------------------------------------------------------------------------------------

router.delete('/delete-job-posting-ajax', function(req, res, next){
    console.log("Delete request received for job posting ID:", req.body.id);
    
    let jobPostingID = parseInt(req.body.id);
    let deleteJobPosting = `DELETE FROM JobPostings WHERE idPosting = ?`;

    console.log("Executing query:", deleteJobPosting, "with ID:", jobPostingID);

    db.pool.query(deleteJobPosting, [jobPostingID], function(error, result){
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "An error occurred while deleting the job posting.", details: error.message });
        }
        
        console.log("Query result:", result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Job posting not found." });
        }
        
        res.status(200).json({ message: "Job posting deleted successfully." });
    });
});

// ------------------------------------------------------------------------------------------

router.put('/put-job-posting-ajax', function(req, res, next){
    let data = req.body;
    console.log("Received PUT request with data:", req.body);

    // Parse integer values
    let idPosting = parseInt(data.idPosting);
    let idCompany = parseInt(data.idCompany) || null;
    let idRole = parseInt(data.idRole) || null;
    let annualSalary = parseFloat(data.annualSalary) || null;

    // Validate date fields
    let datePosted = data.datePosted ? new Date(data.datePosted) : null;
    let dateApplied = data.dateApplied ? new Date(data.dateApplied) : null;

    // Other fields will be empty strings if not provided
    let jobTitle = data.jobTitle || '';
    let status = data.status || '';
    let description = data.description || '';
    let salaryCurrency = data.salaryCurrency || '';
    let location = data.location || '';
    let workMode = data.workMode || '';
  
    // Prepare the values array
    const values = [
        idCompany,
        idRole,
        jobTitle,
        datePosted,
        dateApplied,
        status,
        description,
        annualSalary,
        salaryCurrency,
        location,
        workMode,
        idPosting
    ];

    // Prepare the update query
    let queryUpdateJobPosting = 
        `UPDATE JobPostings SET 
        idCompany = ?, 
        idRole = ?, 
        jobTitle = ?,
        datePosted = ?, 
        dateApplied = ?, 
        status = ?,
        description = ?,
        annualSalary = ?,
        salaryCurrency = ?,
        location = ?,
        workMode = ?
        WHERE idPosting = ?`;
  
    // // Prepare the select query to get updated data
    // let selectJobPosting = `
    //   SELECT jp.*, c.companyName, r.role 
    //   FROM JobPostings jp
    //   LEFT JOIN Companies c ON jp.idCompany = c.idCompany
    //   LEFT JOIN Roles r ON jp.idRole = r.idRole
    //   WHERE jp.idPosting = ?`;
  
    // Run the update query
    db.pool.query(queryUpdateJobPosting, values, function(error, result){
        if (error) {
            console.error("Database error:", error);
            res.status(400).json({ error: error.message });
        } else {
            // Fetch the updated job posting
            let selectQuery = `
                SELECT jp.*, c.companyName, r.role 
                FROM JobPostings jp
                LEFT JOIN Companies c ON jp.idCompany = c.idCompany
                LEFT JOIN Roles r ON jp.idRole = r.idRole
                WHERE jp.idPosting = ?`;
            
            db.pool.query(selectQuery, [idPosting], function(error, rows) {
                if (error) {
                    console.error("Error fetching updated job posting:", error);
                    res.status(400).json({ error: error.message });
                } else {
                    if (rows.length > 0) {
                        console.log("Sending back updated job posting:", rows[0]);
                        res.json(rows[0]);
                    } else {
                        res.status(404).json({ error: "Updated job posting not found" });
                    }
                }
            });
        }
    });
});


module.exports = router;