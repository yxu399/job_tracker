let dataLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('skills-table');
    
    dataLoaded = true;
    console.log('Skills data loaded');

    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-skill')) {
            if (!dataLoaded) {
                alert('Please wait, loading necessary data...');
                return;
            }
            const row = e.target.closest('tr');
            toggleEditMode(row);
        }
    });

    function toggleEditMode(row) {
        const isEditing = row.classList.toggle('editing');
        const editButton = row.querySelector('.edit-skill');
    
        if (isEditing) {
            enterEditMode(row);
            editButton.textContent = 'Save';
            editButton.classList.replace('btn-primary', 'btn-success');
        } else {
            saveChanges(row).then(updatedSkill => {
                updateRowDisplay(row, updatedSkill);
                editButton.textContent = 'Edit';
                editButton.classList.replace('btn-success', 'btn-primary');
            }).catch(error => {
                console.error('Failed to update skill:', error);
                row.classList.add('editing');
                editButton.textContent = 'Save';
                editButton.classList.replace('btn-primary', 'btn-success');
                alert('Failed to update skill. Please try again.');
            });
        }
    }

    function enterEditMode(row) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            const value = cell.textContent.trim();
            const input = createInputField(field, value);
            cell.textContent = '';
            cell.appendChild(input);
        });
    }

    function createInputField(field, value) {
        let input;
        switch(field) {
            case 'haveSkill':
                input = createHaveSkillDropdown(value);
                break;
            case 'userProficiency':
                input = createProficiencyDropdown(value);
                break;
            case 'description':
                input = document.createElement('textarea');
                input.rows = 3;
                input.value = value;
                break;
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                break;
        }
        input.classList.add('form-control');
        return input;
    }

    function createHaveSkillDropdown(currentValue) {
        const select = document.createElement('select');
        ['Yes', 'No'].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option === 'Yes' ? '1' : '0';
            optionElement.textContent = option;
            if (option === currentValue) optionElement.selected = true;
            select.appendChild(optionElement);
        });
        return select;
    }

    function createProficiencyDropdown(currentValue) {
        const select = document.createElement('select');
        ['Beginner', 'Intermediate', 'Advanced'].forEach(proficiency => {
            const option = document.createElement('option');
            option.value = proficiency;
            option.textContent = proficiency;
            if (proficiency === currentValue) option.selected = true;
            select.appendChild(option);
        });
        return select;
    }

    function saveChanges(row) {
        const updatedData = {};
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            const input = cell.firstChild;
            updatedData[field] = input.type === 'select-one' ? input.options[input.selectedIndex].text : input.value;
            if (field === 'haveSkill') updatedData[field] = input.value === '1';
        });

        const id = row.getAttribute('data-id');
        return updateSkill(id, updatedData);
    }

    function updateRowDisplay(row, updatedSkill) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            if (field in updatedSkill) {
                if (field === 'haveSkill') {
                    cell.textContent = updatedSkill[field] ? 'Yes' : 'No';
                } else {
                    cell.textContent = updatedSkill[field];
                }
            }
        });
    }

    function updateSkill(id, updatedData) {
        const changedData = Object.entries(updatedData).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') acc[key] = value;
            return acc;
        }, {});

        return fetch(`/skills/put-skill-ajax`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idSkill: id, ...changedData }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
    }
});