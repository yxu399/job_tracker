// add_posting_skill.js

// Get the objects we need to modify
let addPostingSkillForm = document.getElementById('add-posting-skill-form-ajax');

function validateForm() {
    let requiredFields = ['input-idPosting-ajax', 'input-idSkill-ajax', 'input-requiredProficiency-ajax'];
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
addPostingSkillForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Get form fields we need to get data from
    let inputPosting = document.getElementById("input-idPosting-ajax");
    let inputSkill = document.getElementById("input-idSkill-ajax");
    let inputRequiredProficiency = document.getElementById("input-requiredProficiency-ajax");

    // Get the values from the form fields
    let postingValue = inputPosting.value;
    let skillValue = inputSkill.value;
    let requiredProficiencyValue = inputRequiredProficiency.value;

    // Put our data we want to send in a javascript object
    let data = {
        idPosting: postingValue,
        idSkill: skillValue,
        requiredProficiency: requiredProficiencyValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/postingsSkills/add-posting-skill-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {

                console.log('Response received:', xhttp.responseText);
                // Add the new data to the table
                addRowToTable(xhttp.response);
    
                // Clear the input fields for another transaction
                addPostingSkillForm.reset();
                document.querySelectorAll('.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid');
                });

                // Close the modal
                let addModal = bootstrap.Modal.getInstance(document.getElementById('addPostingSkillModal'));
                addModal.hide();
                
                // Refresh the page
                window.location.reload();

            } else {
                console.error("Error adding posting skill:", xhttp.status, xhttp.statusText);
                console.error("Response:", xhttp.responseText);
                alert("There was an error adding the posting skill. Please check the console for details.");
            }
        }
    };

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Creates a single row from an Object representing a single record from PostingsSkills
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
    row.setAttribute("data-id", newRow.idPostingSkill);

    // Fill the cells with correct data
    row.innerHTML = `
        <td>${newRow.idPostingSkill}</td>
        <td>${newRow.jobTitle}</td>
        <td>${newRow.skillName}</td>
        <td>${newRow.requiredProficiency}</td>
        <td>
            <button class="btn btn-primary btn-sm edit-posting-skill" 
                data-id="${newRow.idPostingSkill}">
                Edit
            </button>
        </td>
        <td>
            <button 
                class="btn btn-danger btn-sm delete-posting-skill"
                data-id="${newRow.idPostingSkill}" >
                Delete
            </button>
        </td>
    `;

    // Add the row to the table
    document.getElementById("postings-skills-table").getElementsByTagName('tbody')[0].appendChild(row);
};