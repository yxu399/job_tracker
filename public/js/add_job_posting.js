// add_job_posting.js

// Get the objects we need to modify
let addJobPostingForm = document.getElementById('add-job-posting-form-ajax');

function validateForm() {
    let requiredFields = ['input-idCompany-ajax', 'input-jobTitle-ajax'];
    for (let field of requiredFields) {
        let inputField = document.getElementById(field);
        if (!inputField.value) {
            alert(`Please fill out the ${field.replace('input-', '').replace('-ajax', '')} field.`);
            inputField.classList.add('is-invalid');
            return false;
        } else {
            inputField.classList.remove('is-invalid');
        }
    }
    return true;
}

// Modify the objects we need
addJobPostingForm.addEventListener("submit", function (e) {
    
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
        idRole: roleValue ? roleValue : null,  
        jobTitle: jobTitleValue,
        datePosted: datePostedValue || null,
        dateApplied: dateAppliedValue || null,
        status: statusValue,
        description: descriptionValue,
        annualSalary: annualSalaryValue || null,
        salaryCurrency: salaryCurrencyValue || null,
        location: locationValue || null,
        workMode: workModeValue || null
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/jobPostings/add-job-posting-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {

                console.log('Response received:', xhttp.responseText);
                // Add the new data to the table
                addRowToTable(xhttp.response);
    
                // Clear the input fields for another transaction
                addJobPostingForm.reset();
                document.querySelectorAll('.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid');
                });

                // Close the modal
                let addModal = bootstrap.Modal.getInstance(document.getElementById('addJobPostingModal'));
                addModal.hide();
                
                // Refresh the page
                window.location.reload();

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
    console.log('Received data:', data);

    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (error) {
        console.error('Error parsing data:', error);
        parsedData = data;  // If it's already an object, use it as is
    }
    console.log('Parsed data:', parsedData);

    let newRow = Array.isArray(parsedData) ? parsedData[0] : parsedData;
    console.log('New row data:', newRow);

    let row = document.createElement("TR");
    row.setAttribute("data-id", newRow.idPosting);

    // Fill the cells with correct data
    row.innerHTML = `
        <td>${newRow.idPosting}</td>
        <td>${newRow.companyName}</td>
        <td>${newRow.roleName || 'N/A'}</td>
        <td>${newRow.jobTitle}</td>
        <td>${newRow.datePosted}</td>
        <td>${newRow.dateApplied || 'N/A'}</td>
        <td>${newRow.status }</td>
        <td>${newRow.description || 'N/A'}</td>
        <td>${newRow.annualSalary || 'N/A'}</td>
        <td>${newRow.salaryCurrency || 'N/A'}</td>
        <td>${newRow.location || 'N/A'}</td>
        <td>${newRow.workMode || 'N/A'}</td>
        <td>
            <button class="btn btn-primary btn-sm" 
                data-bs-toggle="modal" 
                data-bs-target="#updateJobPostingModal" 
                onclick="loadJobPostingData(${newRow.idPosting})">
                Edit
                </button>
        </td>
        <td>
            <button 
                class="btn btn-danger btn-sm delete-job-posting" 
                data-id="${newRow.idPosting}" >
                Delete
            </button>
        </td>
    `;

    // Add the row to the table
    document.getElementById("job-postings-table").getElementsByTagName('tbody')[0].appendChild(row);
};