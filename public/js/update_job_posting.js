// Get the objects we need to modify
let updateJobPostingForm = document.getElementById('update-job-posting-form-ajax');

// Modify the objects we need
updateJobPostingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = Object.fromEntries(formData);

    // Convert dates to ISO format
    data.datePosted = data.datePosted ? new Date(data.datePosted).toISOString().split('T')[0] : null;
    data.dateApplied = data.dateApplied ? new Date(data.dateApplied).toISOString().split('T')[0] : null;

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/update-job-posting", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // Update the row with the new data
            updateRow(JSON.parse(xhttp.response));
            // Clear the form
            this.reset();
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Function to populate the form with existing data
function populateForm(data) {
    document.getElementById("mySelect").value = data.idPosting;
    document.getElementById("input-idCompany-update").value = data.companyName;
    document.getElementById("input-idRole-update").value = data.roleName || ''; // Handle null or undefined
    document.getElementById("input-jobTitle-update").value = data.jobTitle;
    document.getElementById("input-datePosted-update").value = formatDate(data.datePosted, 'input');
    document.getElementById("input-dateApplied-update").value = formatDate(data.dateApplied, 'input');
    document.getElementById("input-status-update").value = data.status;
    document.getElementById("input-description-update").value = data.description;
    document.getElementById("input-annualSalary-update").value = data.annualSalary;
    document.getElementById("input-salaryCurrency-update").value = data.salaryCurrency;
    document.getElementById("input-location-update").value = data.location;
    document.getElementById("input-workMode-update").value = data.workMode;
}

// Function to update a table row with new data
function updateRow(data) {
    let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    let table = document.getElementById("job-postings-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
       if (row.getAttribute("data-value") == parsedData.idPosting) {
            row.getElementsByTagName("td")[1].textContent = parsedData.companyName;
            row.getElementsByTagName("td")[2].textContent = parsedData.roleName;
            row.getElementsByTagName("td")[3].textContent = parsedData.jobTitle;
            row.getElementsByTagName("td")[4].textContent = formatDate(parsedData.datePosted, 'display');
            row.getElementsByTagName("td")[5].textContent = formatDate(parsedData.dateApplied, 'display');
            row.getElementsByTagName("td")[6].textContent = parsedData.status;
            row.getElementsByTagName("td")[7].textContent = parsedData.description;
            row.getElementsByTagName("td")[8].textContent = parsedData.annualSalary;
            row.getElementsByTagName("td")[9].textContent = parsedData.salaryCurrency;
            row.getElementsByTagName("td")[10].textContent = parsedData.location;
            row.getElementsByTagName("td")[11].textContent = parsedData.workMode;
            break;
       }
    }
}

// Unified formatDate function
function formatDate(dateString, format = 'display') {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (format === 'input') {
        return date.toISOString().split('T')[0];
    } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}