// -- --------------------------------------------------------------------
// -- Citation for the following file:
// -- Date: 08/04/2024
// -- Adapted from OSU-CS340-ecampus nodejs-starter-app files
// -- Templates updated for the subject database.
// -- Modified to include additional functionality, styling, and forms.
// -- Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app
// -- --------------------------------------------------------------------

// companiesRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

router.get('/', function(req, res) {
    console.log('Companies route hit');
    // Declare Query 1
    let query1;
    let queryParams = [];

    if (req.query.companyName === undefined) {
        query1 =   `SELECT * FROM Companies;`;
    } else {
        query1 = `SELECT * FROM Companies WHERE companyName LIKE ?;`;
        queryParams.push(`%${req.query.companyName}%`);
    }

    // Run the 1st query
    console.time('database query');
    db.pool.query(query1, queryParams, function(error, companies, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        companies = companies.map(company => {
            company.foundedDate = formatDateToDisplay(company.foundedDate);
            return company;
        });

        // Send the response
        res.render('companies', { data: companies });
    });
});

function formatDateToDisplay(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return null;
    }
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}


// ------------------------------------------------------------------------------------------

router.post('/add-company-ajax', function(req, res)
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Log the incoming data for debugging
     console.log('Received data:', data);

    // Capture NULL values
    let companySize = parseInt(data.companySize);
    if (isNaN(companySize)) 
    {
        companySize = 'NULL';
    }


    // Create the query and run it on the database
    const query1 = `INSERT INTO Companies (companyName, industry, 
    companySize, foundedDate, contactPerson, contactEmail, contactPhone) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Prepare values array
    const values = [
        data.companyName,
        data.industry,
        data.companySize,
        data.foundedDate ? new Date(data.foundedDate).toISOString().split('T')[0] : null,
        data.contactPerson,
        data.contactEmail,
        data.contactPhone
    ];

    // // Log the query and values for debugging purpose
    // console.log('Query:', query1);
    // console.log('Values:', values);
    
    db.pool.query(query1, values, function(error, result) {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Error adding company', details: error.message });
        } else {
            // Fetch the newly inserted row
            const fetchQuery = `SELECT * FROM Companies WHERE idCompany = ?`;

            db.pool.query(fetchQuery, [result.insertId], function(fetchError, fetchResult) {
                if (fetchError) {
                    console.error('Error fetching new company:', fetchError);
                    res.status(500).json({ error: 'Error fetching new company', details: fetchError.message });
                } else {
                    const formattedResult = fetchResult.map(company => {
                        if (company.foundedDate) {
                            company.foundedDate = formatDateToDisplay(company.foundedDate);
                        }
                        return company;
                    });
                    console.log('Fetched result:', formattedResult); 
                    res.json(formattedResult);
                }
            });
            }
        });
    });

// function adjustDateForStorage(dateString) {
//     if (!dateString) return null;
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//         console.error('Invalid date:', dateString);
//         return null;
//     }
//     return date.toISOString().split('T')[0];
// }



module.exports = router;