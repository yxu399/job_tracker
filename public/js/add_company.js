// -- --------------------------------------------------------------------
// -- Citation for the following file:
// -- Date: 08/04/2024
// -- Adapted from OSU-CS340-ecampus nodejs-starter-app files
// -- Templates updated for the subject database.
// -- Modified to include additional functionality, styling, and forms.
// -- Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app
// -- --------------------------------------------------------------------

// add_company.js

// Get the objects we need to modify
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Get the objects we need to modify
    let addCompanyForm = document.getElementById('add-company-form-ajax');

    if (!addCompanyForm) {
        console.error('Add company form not found');
        return;
    }

    console.log('Add company form found');

    function validateForm() {
        let requiredFields = ['input-companyName-ajax', 'input-industry-ajax'];
        for (let field of requiredFields) {
            let inputField = document.getElementById(field);
            if (!inputField) {
                console.error(`Field ${field} not found`);
                return false;
            }
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
    addCompanyForm.addEventListener("submit", function (e) {
        console.log('Form submitted');
        
        // Prevent the form from submitting
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Get form fields we need to get data from
        let inputCompanyName = document.getElementById("input-companyName-ajax");
        let inputIndustry = document.getElementById("input-industry-ajax");
        let inputCompanySize = document.getElementById("input-companySize-ajax");
        let inputFoundedDate = document.getElementById("input-foundedDate-ajax");
        let inputContactPerson = document.getElementById("input-contactPerson-ajax");
        let inputContactEmail = document.getElementById("input-contactEmail-ajax");
        let inputContactPhone = document.getElementById("input-contactPhone-ajax");

        // Get the values from the form fields
        let data = {
            companyName: inputCompanyName.value,
            industry: inputIndustry.value,
            companySize: inputCompanySize.value || null,
            foundedDate: inputFoundedDate.value || null,
            contactPerson: inputContactPerson.value || null,
            contactEmail: inputContactEmail.value || null,
            contactPhone: inputContactPhone.value || null
        }

        console.log('Sending data:', data);
        
        // Setup our AJAX request
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/companies/add-company-ajax", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // Tell our AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    console.log('Response received:', xhttp.responseText);

                    // Add the new data to the table
                    addRowToTable(xhttp.response);
        
                    // Clear the input fields for another transaction
                    addCompanyForm.reset();
                    document.querySelectorAll('.is-invalid').forEach(field => {
                        field.classList.remove('is-invalid');
                    });

                    // Close the modal
                    let addModal = bootstrap.Modal.getInstance(document.getElementById('addCompanyModal'));
                    if (addModal) {
                        addModal.hide();
                    } else {
                        console.error('Modal not found');
                    }
                    
                    // Refresh the page
                    window.location.reload();

                } else {
                    console.error("Error adding company:", xhttp.status, xhttp.statusText);
                    console.error("Response:", xhttp.responseText);
                    alert("There was an error adding the company. Please check the console for details.");
                }
            }
        };

        // Send the request and wait for the response
        xhttp.send(JSON.stringify(data));
    });

// Creates a single row from an Object representing a single record from Companies
function addRowToTable(data) {
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
    row.setAttribute("data-id", newRow.idCompany);

    // Fill the cells with correct data
    row.innerHTML = `
        <td>${newRow.idCompany}</td>
        <td>${newRow.companyName}</td>
        <td>${newRow.industry}</td>
        <td>${newRow.companySize || 'N/A'}</td>
        <td>${newRow.foundedDate}</td>
        <td>${newRow.contactPerson || 'N/A'}</td>
        <td>${newRow.contactEmail || 'N/A'}</td>
        <td>${newRow.contactPhone || 'N/A'}</td>
    `;

    // Add the row to the table
    let table = document.getElementById("companies-table");
    if (table) {
        let tbody = table.getElementsByTagName('tbody')[0];
        if (tbody) {
            tbody.appendChild(row);
        } else {
            console.error('Table body not found');
        }
    } else {
        console.error('Companies table not found');
    }
}
});