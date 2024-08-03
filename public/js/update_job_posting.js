// Get the objects we need to modify
let updateJobPostingForm = document.getElementById('update-job-posting-form-ajax');

// Modify the objects we need
updateJobPostingForm.addEventListener("submit", function (e) {
   
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputJobPosting = document.getElementById("job-posting-select");
    let inputCompany = document.getElementById("input-company-update");
    let inputRole = document.getElementById("input-role-update");
    let inputJobTitle = document.getElementById("input-job-title-update");
    let inputDatePosted = document.getElementById("input-date-posted-update");
    let inputDateApplied = document.getElementById("input-date-applied-update");
    let inputStatus = document.getElementById("input-status-update");
    let inputDescription = document.getElementById("input-description-update");
    let inputAnnualSalary = document.getElementById("input-annual-salary-update");
    let inputSalaryCurrency = document.getElementById("input-salary-currency-update");
    let inputLocation = document.getElementById("input-location-update");
    let inputWorkMode = document.getElementById("input-work-mode-update");

    // Get the values from the form fields
    let jobPostingValue = inputJobPosting.value;
    let companyValue = inputCompany.value;
    let roleValue = inputRole.value;
    let jobTitleValue = inputJobTitle.value;
    let datePostedValue = inputDatePosted.value;
    let dateAppliedValue = inputDateApplied.value;
    let statusValue = inputStatus.value;
    let descriptionValue = inputDescription.value;
    let annualSalaryValue = inputAnnualSalary.value;
    let salaryCurrencyValue = inputSalaryCurrency.value;
    let locationValue = inputLocation.value;
    let workModeValue = inputWorkMode.value;

    // Put our data we want to send in a javascript object
    let data = {
        idPosting: jobPostingValue,
        idCompany: companyValue,
        idRole: roleValue,
        jobTitle: jobTitleValue,
        datePosted: datePostedValue,
        dateApplied: dateAppliedValue,
        status: statusValue,
        description: descriptionValue,
        annualSalary: annualSalaryValue,
        salaryCurrency: salaryCurrencyValue,
        location: locationValue,
        workMode: workModeValue
    }
    
    console.log("Data being sent to server:", data);

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/jobPostings/put-job-posting-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            console.log("AJAX response received. Status:", xhttp.status);
            console.log("Response text:", xhttp.responseText);
            
            if (xhttp.status == 200) {
                let response;
                try {
                    response = JSON.parse(xhttp.responseText);
                    console.log("Parsed response:", response);
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    console.log("Raw response:", xhttp.responseText);
                    return;
                }
    
                if (response && response.idPosting) {
                    console.log("Updating row with ID:", response.idPosting);
                    updateRow(xhttp.responseText, response.idPosting.toString());

                // Clear the input fields for another transaction
                inputJobPosting.value = '';
                inputCompany.value = '';
                inputRole.value = '';
                inputJobTitle.value = '';
                inputDatePosted.value = '';
                inputDateApplied.value = '';
                inputStatus.value = '';
                inputDescription.value = '';
                inputAnnualSalary.value = '';
                inputSalaryCurrency.value = '';
                inputLocation.value = '';
                inputWorkMode.value = '';
            } else if (response && response.message === "Update successful") {
                console.log("Update successful, but no job posting data returned. Refreshing the page.");
                // Optionally refresh the page or fetch the updated data
                window.location.reload();
            } else {
                console.error("Unexpected response format:", response);
            }
        } else {
            console.error("AJAX request failed. Status:", xhttp.status);
        }
    }
}

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));

})

function updateRow(data, jobPostingID) {
    console.log("updateRow called with jobPostingID:", jobPostingID);
    let parsedData = JSON.parse(data);
    console.log("Parsed data:", parsedData);

    let table = document.getElementById("job-postings-table");

    if (!table) {
        console.error("Could not find table with id 'job-postings-table'");
        return;
    }

    console.log("Total rows in table:", table.rows.length);

    let rowFound = false;

    // Start from 1 to skip the header row, if you have one
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let cells = row.getElementsByTagName("td");
        
        if (cells.length > 0) {
            let rowId = cells[0].textContent.trim(); // Get the ID from the first cell
            console.log(`Checking row ${i}, first cell content: ${rowId}`);

            if (rowId == jobPostingID) {
                rowFound = true;
                console.log(`Match found in row ${i}`);

                if (cells.length < 12) {
                    console.error(`Row ${i} does not have enough cells. Expected at least 12, found ${cells.length}`);
                    return;
                }

                // Update cells
                cells[1].textContent = parsedData.companyName || ''; 
                cells[2].textContent = parsedData.role || '';
                cells[3].textContent = parsedData.jobTitle || '';
                cells[4].textContent = parsedData.datePosted || '';
                cells[5].textContent = parsedData.dateApplied || '';
                cells[6].textContent = parsedData.status || '';
                cells[7].textContent = parsedData.description || '';
                cells[8].textContent = parsedData.annualSalary || '';
                cells[9].textContent = parsedData.salaryCurrency || '';
                cells[10].textContent = parsedData.location || '';
                cells[11].textContent = parsedData.workMode || '';

                console.log("Row updated successfully");
                break;
            }
        }
    }

    if (!rowFound) {
        console.error("No matching row found for job posting ID:", jobPostingID);
    }
}