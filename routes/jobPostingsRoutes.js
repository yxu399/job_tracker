
// jobPostingsRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res)
{
    // Declare Query 1
    let query1;
    let queryParams = [];

    // If there is no query string, we just perform a basic SELECT
    if (req.query.jobTitle === undefined)
    {
        query1 = "SELECT * FROM JobPostings;";
    }
    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM JobPostings WHERE jobTitle LIKE ?`;
        queryParams.push(`%${req.query.jobTitle}%`);
    }

    // Query 2 to get all companies 
    let query2 = "SELECT * FROM Companies;";

    // Query 3 to get all roles (assuming you want to include roles as well)
    let query3 = "SELECT * FROM Roles;";

    // Run the 1st query
    db.pool.query(query1, queryParams, function(error, rows, fields){
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }
        
        // Save the job postings
        let jobPostings = rows;
        
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
            
            // Save the companies
            let companies = rows;

            // Run the third query
            db.pool.query(query3, (error, rows, fields) => {
                if (error) {
                    console.log(error);
                    res.sendStatus(500);
                    return;
                }

                // Save the roles
                let roles = rows;

                // Construct an object for reference in the table
                let companyMap = {}
                companies.map(company => {
                    let id = parseInt(company.idCompany, 10);
                    companyMap[id] = company["companyName"];
                })

                // Overwrite the idCompany with the name of the company in the jobPostings object
                jobPostings = jobPostings.map(posting => {
                    return Object.assign(posting, {companyName: companyMap[posting.idCompany]})
                })

                return res.render('jobPostings', {
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
    query1 = `INSERT INTO JobPostings JobPostings (idCompany, idRole, 
    jobTitle, datePosted, dateApplied, status, description, 
    annualSalary, salaryCurrency, location, workMode) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Prepare values array
    let values = [
        idCompany,
        idRole,
        data['input-jobTitle'] || null,
        data['input-datePosted'] || null,
        data['input-dateApplied'] || null,
        data['input-status'] || null,
        data['input-description'] || null,
        annualSalary,
        data['input-salaryCurrency'] || null,
        data['input-location'] || null,
        data['input-workMode'] || null
    ];

    // Log the query and values for debugging
    console.log('Query:', query);
    console.log('Values:', values);
    
    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding job posting', details: error.message });
        } else {
            res.json({ message: 'Job posting added successfully' });
        }
    });
});

// ------------------------------------------------------------------------------------------

router.delete('/delete-job-posting/', function(req,res,next){
    let data = req.body;
    let jobPostingID = parseInt(data.id);
    let deleteJobPosting = `DELETE FROM JobPostings WHERE idPosting = ?`;

    db.pool.query(deleteJobPosting, [jobPostingID], function(error, result){
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    });
});

// ------------------------------------------------------------------------------------------

router.put('/update-job-posting', function(req,res,next){                                   
    let data = req.body;
    let idPosting = parseInt(data.idPosting);
    let idCompany = parseInt(data.idCompany);
    let idRole = parseInt(data.idRole);
    let annualSalary = parseFloat(data.annualSalary);

    let queryUpdateJobPosting = `UPDATE JobPostings 
                                 SET idCompany = ?, idRole = ?, jobTitle = ?, datePosted = ?, dateApplied = ?, 
                                     status = ?, description = ?, annualSalary = ?, salaryCurrency = ?, 
                                     location = ?, workMode = ? 
                                 WHERE idPosting = ?`;
    
    let values = [
        idCompany,
        isNaN(idRole) ? null : idRole,
        data.jobTitle,
        data.datePosted || null,
        data.dateApplied || null,
        data.status,
        data.description,
        isNaN(annualSalary) ? null : annualSalary,
        data.salaryCurrency,
        data.location,
        data.workMode,
        idPosting
    ];

    db.pool.query(queryUpdateJobPosting, values, function(error, result){
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = router;