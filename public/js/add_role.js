// add_role.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Get the objects we need to modify
    let addRoleForm = document.getElementById('add-role-form-ajax');

    if (!addRoleForm) {
        console.error('Add role form not found');
        return;
    }

    console.log('Add role form found');

    function validateForm() {
        let inputRole = document.getElementById('input-role-ajax');
        if (!inputRole) {
            console.error('Role input field not found');
            return false;
        }
        if (!inputRole.value) {
            alert('Please fill out the role field.');
            inputRole.classList.add('is-invalid');
            return false;
        } else {
            inputRole.classList.remove('is-invalid');
        }
        return true;
    }

    // Modify the objects we need
    addRoleForm.addEventListener("submit", function (e) {
        console.log('Form submitted');
        
        // Prevent the form from submitting
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Get form fields we need to get data from
        let inputRole = document.getElementById("input-role-ajax");

        // Get the values from the form fields
        let data = {
            role: inputRole.value
        }

        console.log('Sending data:', data);
        
        // Setup our AJAX request
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/roles/add-role-ajax", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // Tell our AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    console.log('Response received:', xhttp.responseText);

                    // Add the new data to the table
                    addRowToTable(xhttp.response);
        
                    // Clear the input fields for another transaction
                    addRoleForm.reset();
                    document.querySelectorAll('.is-invalid').forEach(field => {
                        field.classList.remove('is-invalid');
                    });

                    // Close the modal
                    let addModal = bootstrap.Modal.getInstance(document.getElementById('addRoleModal'));
                    if (addModal) {
                        addModal.hide();
                    } else {
                        console.error('Modal not found');
                    }
                    
                    // Refresh the page
                    window.location.reload();

                } else {
                    console.error("Error adding role:", xhttp.status, xhttp.statusText);
                    console.error("Response:", xhttp.responseText);
                    alert("There was an error adding the role. Please check the console for details.");
                }
            }
        };

        // Send the request and wait for the response
        xhttp.send(JSON.stringify(data));
    });

    // Creates a single row from an Object representing a single record from Roles
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
        row.setAttribute("data-id", newRow.idRole);

        // Fill the cells with correct data
        row.innerHTML = `
            <td>${newRow.idRole}</td>
            <td>${newRow.role}</td>
        `;

        // Add the row to the table
        let table = document.getElementById("roles-table");
        if (table) {
            let tbody = table.getElementsByTagName('tbody')[0];
            if (tbody) {
                tbody.appendChild(row);
            } else {
                console.error('Table body not found');
            }
        } else {
            console.error('Roles table not found');
        }
    }
});