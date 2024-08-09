// update_posting_skill.js

let jobPostings = [];
let skills = [];
let dataLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('postings-skills-table');
    
    loadData().then(() => {
        dataLoaded = true;
        console.log('Job Postings and Skills loaded');
    }).catch(error => {
        console.error('Error loading job postings and skills:', error);
    });

    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-posting-skill')) {
            if (!dataLoaded) {
                alert('Please wait, loading necessary data...');
                return;
            }
            const row = e.target.closest('tr');
            toggleEditMode(row);
        }
    });

    function loadData() {
        return Promise.all([
            fetch('/postingsSkills/get-job-postings').then(res => res.json()),
            fetch('/postingsSkills/get-skills').then(res => res.json())
        ]).then(([fetchedJobPostings, fetchedSkills]) => {
            jobPostings = Array.isArray(fetchedJobPostings) ? fetchedJobPostings : [];
            skills = Array.isArray(fetchedSkills) ? fetchedSkills : [];
            console.log('Job Postings:', jobPostings);
            console.log('Skills:', skills);
        }).catch(error => {
            console.error('Error loading data:', error);
            jobPostings = [];
            skills = [];
        });
    }

    function toggleEditMode(row) {
        const isEditing = row.classList.toggle('editing');
        const editButton = row.querySelector('.edit-posting-skill');
    
        if (isEditing) {
            enterEditMode(row);
            editButton.textContent = 'Save';
            editButton.classList.replace('btn-primary', 'btn-success');
        } else {
            saveChanges(row).then(updatedPostingSkill => {
                updateRowDisplay(row, updatedPostingSkill);
                editButton.textContent = 'Edit';
                editButton.classList.replace('btn-success', 'btn-primary');
            }).catch(error => {
                console.error('Failed to update posting skill:', error);
                row.classList.add('editing');
                editButton.textContent = 'Save';
                editButton.classList.replace('btn-primary', 'btn-success');
                alert('Failed to update posting skill. Please try again.');
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
            case 'jobTitle':
                input = createDropdown(jobPostings, 'idPosting', 'jobTitle', value);
                break;
            case 'skillName':
                input = createDropdown(skills, 'idSkill', 'skillName', value);
                break;
            case 'requiredProficiency':
                input = createProficiencyDropdown(value);
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

    function createDropdown(items, valueField, textField, currentValue) {
        console.log('Creating dropdown:', { items, valueField, textField, currentValue });
        const select = document.createElement('select');
        if (Array.isArray(items)) {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                if (item[textField] === currentValue) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        } else {
            console.error('Items is not an array:', items);
        }
        return select;
    }

    function createProficiencyDropdown(currentValue) {
        const select = document.createElement('select');
        ['Intermediate', 'Advanced', 'Expert'].forEach(proficiency => {
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
            if (field === 'jobTitle') updatedData['idPosting'] = input.value;
            if (field === 'skillName') updatedData['idSkill'] = input.value;
        });

        const id = row.getAttribute('data-id');
        return updatePostingSkill(id, updatedData);
    }

    function updateRowDisplay(row, updatedPostingSkill) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            if (field in updatedPostingSkill) {
                cell.textContent = updatedPostingSkill[field];
            }
        });
    }

    function updatePostingSkill(id, updatedData) {
        const changedData = Object.entries(updatedData).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') acc[key] = value;
            return acc;
        }, {});

        return fetch(`/postingsSkills/update-posting-skill-ajax`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idPostingSkill: id, ...changedData }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
    }
});