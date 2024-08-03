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
            console.log("Server response:", xhttp.responseText);
            if (xhttp.status == 200) {
                // Add the new data to the table
                updateRow(xhttp.response, jobPostingValue);

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
            }
            else {
                console.log("There was an error with the input.")
            }
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));

})

function updateRow(data, jobPostingID){
    let parsedData = JSON.parse(data);
    
    console.log("Parsed data:", parsedData);
    console.log("Job Posting ID to update:", jobPostingID);

    let table = document.getElementById("job-postings-table");

    if (!table) {
        console.error("Table with id 'job-postings-table' not found");
        return;
    }

    for (let i = 0, row; row = table.rows[i]; i++) {
       // Iterate through rows
       // Rows would be accessed using the "row" variable assigned in the for loop
       if (table.rows[i].getAttribute("data-value") == jobPostingID) {
            console.log("Match found in row", i);

            // Get the location of the row where we found the matching job posting ID
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            // Get td of job posting value
            let td = updateRowIndex.getElementsByTagName("td");
            console.log("Number of cells:", td.length);

            // Reassign job posting to our value we updated to
            td[1].innerHTML = parsedData.companyName; 
            td[2].innerHTML = parsedData.role;
            td[3].innerHTML = parsedData.jobTitle;
            td[4].innerHTML = parsedData.datePosted;
            td[5].innerHTML = parsedData.dateApplied;
            td[6].innerHTML = parsedData.status;
            td[7].innerHTML = parsedData.description;
            td[8].innerHTML = parsedData.annualSalary;
            td[9].innerHTML = parsedData.salaryCurrency;
            td[10].innerHTML = parsedData.location;
            td[11].innerHTML = parsedData.workMode;

            console.log("Row updated successfully");
            return;
       }
    }
    console.error("No matching row found for job posting ID:", jobPostingID);
}