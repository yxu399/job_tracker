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
            fetch('/jobPostings/get-companies').then(res => {
                if (!res.ok) throw new Error('Failed to fetch companies');
                return res.json();
            }),
            fetch('/jobPostings/get-roles').then(res => {
                if (!res.ok) throw new Error('Failed to fetch roles');
                return res.json();
            })
        ]).then(([fetchedCompanies, fetchedRoles]) => {
            companies = fetchedCompanies;
            roles = fetchedRoles;
        }).catch(error => {
            console.error('Error loading data:', error);
            alert('Failed to load necessary data. Please refresh the page and try again.');
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
                input.value = value ? formatDateForInput(value) : '';  
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

    function formatDateForInput(dateString) {
        // Ensure the date is in the correct format for the <input type="date">
        const parts = dateString.split('/');
        return `${parts[2]}-${('0' + parts[0]).slice(-2)}-${('0' + parts[1]).slice(-2)}`;
    }
    
    function createDropdown(items, valueField, textField, currentValue) {
        const select = document.createElement('select');
        if (textField === 'role') {
            const noRoleOption = document.createElement('option');
            noRoleOption.value = '';  // Change this to empty string
            noRoleOption.textContent = 'No Role / Unspecified';
            select.appendChild(noRoleOption);
        }
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            if (item[textField] === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        if ((currentValue === null || currentValue === undefined) && textField === 'role') {
            select.value = '';
        }
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
            if (field === 'role') {
                updatedData['idRole'] = input.value === '' ? null : input.value;
                updatedData[field] = input.value === '' ? null : input.options[input.selectedIndex].text;
            } else if (field === 'annualSalary') {
                updatedData[field] = input.value.trim() === '' ? null : input.value;
            } else {
                updatedData[field] = input.type === 'select-one' ? input.options[input.selectedIndex].text : input.value;
                if (field === 'companyName') updatedData['idCompany'] = input.value;
            }
        });
    
        // Ensure idRole is always included in the updatedData
        if (!('idRole' in updatedData)) {
            updatedData['idRole'] = null;
        }
    
        const id = row.getAttribute('data-id');
        return updateJobPosting(id, formatDataForUpdate(updatedData));
    }

    function updateRowDisplay(row, updatedJobPosting) {
        row.querySelectorAll('.editable').forEach(cell => {
            const field = cell.getAttribute('data-field');
            if (field in updatedJobPosting) {
                if (['datePosted', 'dateApplied'].includes(field)) {
                    cell.textContent = updatedJobPosting[field] ? formatDateToDisplay(updatedJobPosting[field]) : '';
                } else if (field === 'role') {
                    cell.textContent = updatedJobPosting[field] || 'N/A';
                } else if (field === 'annualSalary') {
                    cell.textContent = updatedJobPosting[field] !== null ? updatedJobPosting[field] : '';
                } else {
                    cell.textContent = updatedJobPosting[field] !== null ? updatedJobPosting[field] : '';
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
        formatted.datePosted = formatDateForStorage(data.datePosted);
        formatted.dateApplied = formatDateForStorage(data.dateApplied);
        if (formatted.idCompany) formatted.idCompany = Number(formatted.idCompany);
        formatted.idRole = formatted.idRole === 'null' || formatted.idRole === '' ? null : (formatted.idRole ? Number(formatted.idRole) : null);
        
        // Handle annualSalary
        if (formatted.annualSalary === '' || formatted.annualSalary === null) {
            formatted.annualSalary = null;
        } else if (formatted.annualSalary !== undefined) {
            formatted.annualSalary = Number(formatted.annualSalary);
        }
    
        return formatted;
    }

    function formatDateForStorage(dateString) {
        // Return the date string as-is without any manipulation
        return dateString;
    }    

    function updateJobPosting(id, updatedData) {
        const changedData = { ...updatedData, idPosting: id };
    
        return fetch(`/jobPostings/put-job-posting-ajax`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changedData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
    }
});
