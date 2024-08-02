// Get the objects we need to modify
let addJobPostingForm = document.getElementById('add-job-posting-form-ajax');

function validateForm() {
    let requiredFields = ['input-idCompany-ajax', 'input-jobTitle-ajax', 'input-status-ajax'];
    for (let field of requiredFields) {
        if (!document.getElementById(field).value) {
            alert(`Please fill out the ${field.replace('input-', '').replace('-ajax', '')} field.`);
            return false;
        }
    }
    return true;
}

// Modify the objects we need
addJobPostingForm.addEventListener("submit", function (e) 
{
    
    // Prevent the form from submitting
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Get form fields we need to get data from
    let inputCompany = document.getElementById("input-idCompany-ajax");
    let inputRole = document.getElementById("input-idRole-ajax");
    let inputJobTitle = document.getElementById("input-jobTitle-ajax");
    let inputDatePosted = document.getElementById("input-datePosted-ajax");
    let inputDateApplied = document.getElementById("input-dateApplied-ajax");
    let inputStatus = document.getElementById("input-status-ajax");
    let inputDescription = document.getElementById("input-description-ajax");
    let inputAnnualSalary = document.getElementById("input-annualSalary-ajax");
    let inputSalaryCurrency = document.getElementById("input-salaryCurrency-ajax");
    let inputLocation = document.getElementById("input-location-ajax");
    let inputWorkMode = document.getElementById("input-workMode-ajax");

    // Get the values from the form fields
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
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/jobPostings/add-job-posting-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                // Add the new data to the table
                addRowToTable(xhttp.response);
    
                // Clear the input fields for another transaction
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
            } else {
                console.error("Error adding job posting:", xhttp.status, xhttp.statusText);
                console.error("Response:", xhttp.responseText);
                alert("There was an error adding the job posting. Please check the console for details.");
            }
        }
    };

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Creates a single row from an Object representing a single record from JobPostings
addRowToTable = (data) => {

    // Get a reference to the current table on the page and clear it out.
    let currentTable = document.getElementById("job-postings-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let companyCell = document.createElement("TD");
    let roleCell = document.createElement("TD");
    let jobTitleCell = document.createElement("TD");
    let datePostedCell = document.createElement("TD");
    let dateAppliedCell = document.createElement("TD");
    let statusCell = document.createElement("TD");
    let descriptionCell = document.createElement("TD");
    let annualSalaryCell = document.createElement("TD");
    let salaryCurrencyCell = document.createElement("TD");
    let locationCell = document.createElement("TD");
    let workModeCell = document.createElement("TD");
    let editCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.idPosting;
    companyCell.innerText = newRow.idCompany;
    roleCell.innerText = newRow.idRole || 'N/A';
    jobTitleCell.innerText = newRow.jobTitle;
    datePostedCell.innerText = newRow.datePosted;
    dateAppliedCell.innerText = newRow.dateApplied || 'N/A';
    statusCell.innerText = newRow.status;
    descriptionCell.innerText = newRow.description;
    annualSalaryCell.innerText = newRow.annualSalary;
    salaryCurrencyCell.innerText = newRow.salaryCurrency;
    locationCell.innerText = newRow.location;
    workModeCell.innerText = newRow.workMode;

    editCell = document.createElement("button");
    editCell.innerHTML = "Edit";
    editCell.onclick = function(){
        updateJobPosting(newRow.idPosting);
    };
    
    deleteCell = document.createElement("button");
    deleteCell.innerHTML = "Delete";
    deleteCell.onclick = function(){
        deleteJobPosting(newRow.idPosting);
    };

    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(companyCell);
    row.appendChild(roleCell);
    row.appendChild(jobTitleCell);
    row.appendChild(datePostedCell);
    row.appendChild(dateAppliedCell);
    row.appendChild(statusCell);
    row.appendChild(descriptionCell);
    row.appendChild(annualSalaryCell);
    row.appendChild(salaryCurrencyCell);
    row.appendChild(locationCell);
    row.appendChild(workModeCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);
    
    // // Add a custom row attribute so the deleteRow function can find a newly added row
    // row.setAttribute('data-value', newRow.idPosting);

    // Add the row to the table
    currentTable.appendChild(row);

    // // Find drop down menu, create a new option, fill data in the option (job title, id),
    // // then append option to drop down menu so newly created rows via ajax will be found in it without needing a refresh
    // let selectMenu = document.getElementById("mySelect");
    // let option = document.createElement("option");
    // option.text = newRow.jobTitle + ' at ' + newRow.companyName;
    // option.value = newRow.idPosting;
    // selectMenu.add(option);
};