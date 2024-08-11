
// server-side script: jobPostingsRoutes.js

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

        jobPostings = jobPostings.map(posting => {
            posting.datePosted = formatDateToDisplay(posting.datePosted);
            posting.dateApplied = formatDateToDisplay(posting.dateApplied);
            return posting;
        });

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

function formatDateToDisplay(dateString) {
    if (!dateString) return ''; // Handle null dates
    const date = new Date(dateString);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// APIs to support the dropdown functionality for companies and roles
// Get all companies
router.get('/get-companies', function(req, res) {
    let query = "SELECT idCompany, companyName FROM Companies;";
    db.pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.json(results);
    });
});

// Get all roles
router.get('/get-roles', function(req, res) {
    let query = "SELECT idRole, role FROM Roles;";
    db.pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.json(results);
    });
});

// ------------------------------------------------------------------------------------------

router.post('/add-job-posting-ajax', function(req, res)
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    let idCompany = parseInt(data.idCompany); 
    // Validate required fields
    if (isNaN(idCompany)) {
        console.log('Invalid idCompany:', data.idCompany);
        return res.status(400).send('Invalid Company ID');
    }

    // Handle idRole: if it's an empty string or not provided, set it to NULL
    let idRole = data.idRole && data.idRole.trim() !== '' && data.idRole !== 'null' ? parseInt(data.idRole) : null;

    let annualSalary = data.annualSalary && data.annualSalary.trim() !== '' ? parseFloat(data.annualSalary) : null;


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
        adjustDateForStorage(data.datePosted),
        adjustDateForStorage(data.dateApplied),
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
            const fetchQuery = `
                SELECT jp.*, c.companyName, r.role AS roleName 
                FROM JobPostings jp 
                LEFT JOIN Companies c ON jp.idCompany = c.idCompany 
                LEFT JOIN Roles r ON jp.idRole = r.idRole 
                WHERE jp.idPosting = ?`;

                db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                    if (fetchError) {
                        console.error('Error fetching new job posting:', fetchError);
                        res.status(500).json({ error: 'Error fetching new job posting', details: fetchError.message });
                    } else {
                        const formattedResult = fetchResult.map(posting => {
                            posting.datePosted = formatDateToDisplay(posting.datePosted);
                            posting.dateApplied = formatDateToDisplay(posting.dateApplied);
                            return posting;
                        });
                        console.log('Fetched result:', formattedResult); 
                        res.json(formattedResult);
                    }
                });
            }
        });
    });

// ------------------------------------------------------------------------------------------

router.delete('/delete-job-posting/:id', (req, res) => {
    console.log("Received DELETE request for job ID:", req.params.id);  // Debugging log
    const jobId = parseInt(req.params.id);

    if (isNaN(jobId)) {
        console.error("Invalid job ID:", req.params.id);
        return res.status(400).json({ error: "Invalid job ID." });
    }

    const deleteJobPosting = 'DELETE FROM JobPostings WHERE idPosting = ?';

    db.pool.query(deleteJobPosting, [jobId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "An error occurred while deleting the job posting.", details: error.message });
        }

        if (result.affectedRows === 0) {
            console.warn("Job posting not found:", jobId);
            return res.status(404).json({ error: "Job posting not found." });
        }

        console.log("Job posting deleted successfully:", jobId);
        res.status(200).json({ message: "Job posting deleted successfully." });
    });
});


// ------------------------------------------------------------------------------------------

router.put('/put-job-posting-ajax', function(req, res, next) {
    let data = req.body;
    console.log("Received PUT request with data:", JSON.stringify(data, null, 2));

    const dateFields = ['datePosted', 'dateApplied'];
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
    let query = 'UPDATE JobPostings SET ';

    const fields = [
        'idCompany', 
        'idRole', 
        'jobTitle', 
        'datePosted', 
        'dateApplied', 
        'status', 
        'description', 
        'annualSalary', 
        'salaryCurrency', 
        'location', 
        'workMode'
    ];

    fields.forEach(field => {
        if (field === 'idRole' || field === 'annualSalary') {
            if (data[field] === null || data[field] === 'null' || data[field] === '') {
                updateFields.push(`${field} = NULL`);
            } else {
                updateFields.push(`${field} = ?`);
                values.push(field === 'annualSalary' ? parseFloat(data[field]) : parseInt(data[field]));
            }
        } else if (data[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            values.push(data[field]);
        }
    });

    query += updateFields.join(', ') + ' WHERE idPosting = ?';
    values.push(data.idPosting);

    console.log("Prepared query:", query);
    console.log("Prepared values:", values);

    db.pool.query(query, values, function(error, result) {
        if (error) {
            console.error("Database error during update:", error);
            return res.status(500).json({ error: "Database error during update", details: error.message });
        }

        console.log("Update query result:", result);

        if (result.affectedRows === 0) {
            console.warn("No rows were updated. Job posting might not exist.");
            return res.status(404).json({ error: "Job posting not found or no changes made" });
        }

        let selectQuery = `
            SELECT jp.*, c.companyName, r.role 
            FROM JobPostings jp
            LEFT JOIN Companies c ON jp.idCompany = c.idCompany
            LEFT JOIN Roles r ON jp.idRole = r.idRole
            WHERE jp.idPosting = ?`;
        
        db.pool.query(selectQuery, [data.idPosting], function(selectError, rows) {
            if (selectError) {
                console.error("Error fetching updated job posting:", selectError);
                return res.status(500).json({ error: "Error fetching updated job posting", details: selectError.message });
            }
        
            if (rows.length === 0) {
                console.warn("Updated job posting not found in database");
                return res.status(404).json({ error: "Updated job posting not found" });
            }    

            const formattedRow = {...rows[0]};
            formattedRow.datePosted = formattedRow.datePosted ? new Date(formattedRow.datePosted).toISOString().split('T')[0] : '';
            formattedRow.dateApplied = formattedRow.dateApplied ? new Date(formattedRow.dateApplied).toISOString().split('T')[0] : '';
        
            console.log("Sending back updated job posting:", JSON.stringify(formattedRow, null, 2));
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