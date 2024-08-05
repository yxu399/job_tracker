let companies = [];
let roles = [];
let dataLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('job-postings-table');
    
    loadData().then(() => {
        dataLoaded = true;
        console.log('Companies and roles loaded');
    }).catch(error => {
        console.error('Error loading companies and roles:', error);
    });

    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-job-posting')) {
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
            fetch('/jobPostings/get-companies').then(res => res.json()),
            fetch('/jobPostings/get-roles').then(res => res.json())
        ]).then(([fetchedCompanies, fetchedRoles]) => {
            companies = fetchedCompanies;
            roles = fetchedRoles;
        });
    }

    function toggleEditMode(row) {
        const isEditing = row.classList.toggle('editing');
        const editButton = row.querySelector('.edit-job-posting');
    
        if (isEditing) {
            enterEditMode(row);
            editButton.textContent = 'Save';
            editButton.classList.replace('btn-primary', 'btn-success');
        } else {
            saveChanges(row).then(updatedJobPosting => {
                updateRowDisplay(row, updatedJobPosting);
                editButton.textContent = 'Edit';
                editButton.classList.replace('btn-success', 'btn-primary');
            }).catch(error => {
                console.error('Failed to update job posting:', error);
                row.classList.add('editing');
                editButton.textContent = 'Save';
                editButton.classList.replace('btn-primary', 'btn-success');
                alert('Failed to update job posting. Please try again.');
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
            case 'companyName':
                input = createDropdown(companies, 'idCompany', 'companyName', value);
                break;
            case 'role':
                input = createDropdown(roles, 'idRole', 'role', value);
                break;
            case 'description':
                input = document.createElement('textarea');
                input.rows = 3;
                input.value = value;
                break;
            case 'datePosted':
            case 'dateApplied':
                input = document.createElement('input');
                input.type = 'date';
                input.value = formatDateForInput(value);
                break;
            case 'status':
                input = createStatusDropdown(value);
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

    function createStatusDropdown(currentValue) {
        const select = document.createElement('select');
        ['Under Review', 'Interview Scheduled', 'Applied', 'Rejected', 'Offer Extended'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            if (status === currentValue) option.selected = true;
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
            if (field === 'companyName') updatedData['idCompany'] = input.value;
            if (field === 'role') updatedData['idRole'] = input.value;
        });

        const id = row.getAttribute('data-id');
        return updateJobPosting(id, formatDataForUpdate(updatedData));
    }

    function updateRowDisplay(row, updatedJobPosting) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            if (field in updatedJobPosting) {
                cell.textContent = ['datePosted', 'dateApplied'].includes(field) 
                    ? formatDateToDisplay(new Date(updatedJobPosting[field])) 
                    : updatedJobPosting[field];
            }
        });
    }

    function formatDataForUpdate(data) {
        const formatted = { ...data };
        if (formatted.datePosted) formatted.datePosted = formatDate(formatted.datePosted);
        if (formatted.dateApplied) formatted.dateApplied = formatDate(formatted.dateApplied);
        ['idCompany', 'idRole', 'annualSalary'].forEach(field => {
            if (formatted[field]) formatted[field] = Number(formatted[field]);
        });
        return formatted;
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        if (!isNaN(date)) {
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        }
        return '';
    }
    

    function formatDateForInput(dateString) {
        const date = new Date(dateString);
        return !isNaN(date) ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
    }

    function formatDateToDisplay(date) {
        return `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}/${date.getFullYear()}`;
    }

    function updateJobPosting(id, updatedData) {
        const changedData = Object.entries(updatedData).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') acc[key] = value;
            return acc;
        }, {});

        return fetch(`/jobPostings/put-job-posting-ajax`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idPosting: id, ...changedData }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
    }
});
