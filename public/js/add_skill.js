// add_skill.js

// Get the objects we need to modify
let addSkillForm = document.getElementById('add-skill-form-ajax');

function validateForm() {
    let requiredFields = ['input-skillName-ajax', 'input-skillType-ajax'];
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
addSkillForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Get form fields we need to get data from
    let inputSkillName = document.getElementById("input-skillName-ajax");
    let inputSkillType = document.getElementById("input-skillType-ajax");
    let inputHaveSkill = document.getElementById("input-haveSkill-ajax");
    let inputUserProficiency = document.getElementById("input-userProficiency-ajax");
    let inputDescription = document.getElementById("input-description-ajax");

    // Get the values from the form fields
    let skillNameValue = inputSkillName.value;
    let skillTypeValue = inputSkillType.value;
    let haveSkillValue = inputHaveSkill.value;
    let userProficiencyValue = inputUserProficiency.value;
    let descriptionValue = inputDescription.value;

    // Put our data we want to send in a javascript object
    let data = {
        skillName: skillNameValue,
        skillType: skillTypeValue,
        haveSkill: haveSkillValue,
        userProficiency: userProficiencyValue || null,
        description: descriptionValue || null
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/skills/add-skill-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {

                console.log('Response received:', xhttp.responseText);
                // Add the new data to the table
                addRowToTable(xhttp.response);
    
                // Clear the input fields for another transaction
                addSkillForm.reset();
                document.querySelectorAll('.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid');
                });

                // Close the modal
                let addModal = bootstrap.Modal.getInstance(document.getElementById('addSkillModal'));
                addModal.hide();
                
                // Refresh the page
                window.location.reload();

            } else {
                console.error("Error adding skill:", xhttp.status, xhttp.statusText);
                console.error("Response:", xhttp.responseText);
                alert("There was an error adding the skill. Please check the console for details.");
            }
        }
    };

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Creates a single row from an Object representing a single record from Skills
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
    row.setAttribute("data-id", newRow.idSkill);

    // Fill the cells with correct data
    row.innerHTML = `
        <td>${newRow.idSkill}</td>
        <td>${newRow.skillName}</td>
        <td>${newRow.skillType}</td>
        <td>${newRow.haveSkill ? 'Yes' : 'No'}</td>
        <td>${newRow.userProficiency || 'N/A'}</td>
        <td>${newRow.description || 'N/A'}</td>
        <td>
            <button class="btn btn-primary btn-sm edit-skill" 
                data-id="${newRow.idSkill}">
                Edit
            </button>
        </td>
        <td>
            <button 
                class="btn btn-danger btn-sm delete-skill" 
                data-id="${newRow.idSkill}" >
                Delete
            </button>
        </td>
    `;

    // Add the row to the table
    document.getElementById("skills-table").getElementsByTagName('tbody')[0].appendChild(row);
};