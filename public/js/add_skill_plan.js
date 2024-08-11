// -- --------------------------------------------------------------------
// -- Citation for the following file:
// -- Date: 08/04/2024
// -- Adapted from OSU-CS340-ecampus nodejs-starter-app files
// -- Templates updated for the subject database.
// -- Modified to include additional functionality, styling, and forms.
// -- Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app
// -- --------------------------------------------------------------------

// add_skill_plan.js

// Get the objects we need to modify
let addSkillPlanForm = document.getElementById('add-skill-plan-form-ajax');

function validateForm() {
    let requiredFields = ['input-idSkill-ajax'];
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
addSkillPlanForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

     // Get form fields we need to get data from
    let inputSkill = document.getElementById("input-idSkill-ajax");
    let inputDescription = document.getElementById("input-description-ajax");
    let inputSource = document.getElementById("input-source-ajax");
    let inputStartDate = document.getElementById("input-startDate-ajax");
    let inputEndDate = document.getElementById("input-endDate-ajax");
    let inputCost = document.getElementById("input-cost-ajax");
    let inputNote = document.getElementById("input-note-ajax");

    // Get the values from the form fields
    let skillValue = inputSkill.value;
    let descriptionValue = inputDescription.value;
    let sourceValue = inputSource.value;
    let startDateValue = inputStartDate.value;
    let endDateValue = inputEndDate.value;
    let costValue = inputCost.value;
    let noteValue = inputNote.value;

    // Put our data we want to send in a javascript object
    let data = {
        idSkill: skillValue,
        description: descriptionValue || null,
        source: sourceValue || null,
        startDate: startDateValue || null,
        endDate: endDateValue || null,
        cost: costValue || null,
        note: noteValue || null
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/skillPlans/add-skill-plan-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {

                console.log('Response received:', xhttp.responseText);
                // Add the new data to the table
                addRowToTable(xhttp.response);
    
                // Clear the input fields for another transaction
                addSkillPlanForm.reset();
                document.querySelectorAll('.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid');
                });

                // Close the modal
                let addModal = bootstrap.Modal.getInstance(document.getElementById('addSkillPlanModal'));
                addModal.hide();
                
                // Refresh the page
                window.location.reload();

            } else {
                console.error("Error adding skill plan:", xhttp.status, xhttp.statusText);
                console.error("Response:", xhttp.responseText);
                alert("There was an error adding the skill plan. Please check the console for details.");
            }
        }
    };

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Creates a single row from an Object representing a single record from SkillPlans
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
    row.setAttribute("data-id", newRow.idPlan);

    // Fill the cells with correct data
    row.innerHTML = `
        <td>${newRow.idPlan}</td>
        <td>${newRow.skillName}</td>
        <td>${newRow.description || 'N/A'}</td>
        <td>${newRow.source || 'N/A'}</td>
        <td>${newRow.startDate || 'N/A'}</td>
        <td>${newRow.endDate || 'N/A'}</td>
        <td>${newRow.cost || 'N/A'}</td>
        <td>${newRow.note || 'N/A'}</td>
        <td>
            <button class="btn btn-primary btn-sm edit-skill-plan" 
                data-id="${newRow.idPlan}">
                Edit
            </button>
        </td>
        <td>
            <button 
                class="btn btn-danger btn-sm delete-skill-plan" 
                data-id="${newRow.idPlan}" >
                Delete
            </button>
        </td>
        `;

    // Add the row to the table
    document.getElementById("skill-plans-table").getElementsByTagName('tbody')[0].appendChild(row);
};