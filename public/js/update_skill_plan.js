// update_skill_plan.js

let skills = [];
let dataLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('skill-plans-table');
    
    loadData().then(() => {
        dataLoaded = true;
        console.log('Skills loaded');
    }).catch(error => {
        console.error('Error loading skills:', error);
    });

    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-skill-plan')) {
            if (!dataLoaded) {
                alert('Please wait, loading necessary data...');
                return;
            }
            const row = e.target.closest('tr');
            toggleEditMode(row);
        }
    });

    function loadData() {
        return fetch('/skillPlans/get-skills')
            .then(res => res.json())
            .then(fetchedSkills => {
                skills = fetchedSkills;
            });
    }

    function toggleEditMode(row) {
        const isEditing = row.classList.toggle('editing');
        const editButton = row.querySelector('.edit-skill-plan');
    
        if (isEditing) {
            enterEditMode(row);
            editButton.textContent = 'Save';
            editButton.classList.replace('btn-primary', 'btn-success');
        } else {
            saveChanges(row).then(updatedSkillPlan => {
                updateRowDisplay(row, updatedSkillPlan);
                editButton.textContent = 'Edit';
                editButton.classList.replace('btn-success', 'btn-primary');
            }).catch(error => {
                console.error('Failed to update skill plan:', error);
                row.classList.add('editing');
                editButton.textContent = 'Save';
                editButton.classList.replace('btn-primary', 'btn-success');
                alert('Failed to update skill plan. Please try again.');
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
            case 'skillName':
                input = createDropdown(skills, 'idSkill', 'skillName', value);
                break;
            case 'description':
                input = document.createElement('textarea');
                input.rows = 3;
                input.value = value;
                break;
            case 'startDate':
            case 'endDate':
                input = document.createElement('input');
                input.type = 'date';
                input.value = value ? formatDateForInput(value) : '';  
                break;
            case 'source':
            case 'note':
                input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                break;
            case 'cost':
                input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
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
    
    function formatDateForInput(dateString) {
        // Ensure the date is in the correct format for the <input type="date">
        const parts = dateString.split('/');
        return `${parts[2]}-${('0' + parts[0]).slice(-2)}-${('0' + parts[1]).slice(-2)}`;
    }
    

    function createDropdown(items, valueField, textField, currentValue) {
        const select = document.createElement('select');
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            if (item[textField] === currentValue) {
                option.selected = true;
            }
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
            if (field === 'skillName') updatedData['idSkill'] = input.value;
        });

        const id = row.getAttribute('data-id');
        return updateSkillPlan(id, formatDataForUpdate(updatedData));
    }

    function updateRowDisplay(row, updatedSkillPlan) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            if (field in updatedSkillPlan) {
                if (['startDate', 'endDate'].includes(field)) {
                    // Display the date in MM/DD/YYYY format in the table view
                    cell.textContent = updatedSkillPlan[field] ? formatDateToDisplay(updatedSkillPlan[field]) : '';
                } else {
                    cell.textContent = updatedSkillPlan[field];
                }
            }
        });
    }
    
    function formatDateToDisplay(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`; // Convert YYYY-MM-DD to MM/DD/YYYY
    }
    

    function formatDataForUpdate(data) {
        const formatted = { ...data };
        // Store dates as plain strings
        formatted.startDate = formatDateForStorage(data.startDate);
        formatted.endDate = formatDateForStorage(data.endDate);
        if (formatted.cost) formatted.cost = parseFloat(formatted.cost).toFixed(2);
        if (formatted.idSkill) formatted.idSkill = Number(formatted.idSkill);
        return formatted;
    }

    function formatDateForStorage(dateString) {
        // Return the date string as-is without any manipulation
        return dateString;
    }    

    function updateSkillPlan(id, updatedData) {
        const changedData = Object.entries(updatedData).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') acc[key] = value;
            return acc;
        }, {});

        return fetch(`/skillPlans/put-skill-plan-ajax`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idPlan: id, ...changedData }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
    }
});
