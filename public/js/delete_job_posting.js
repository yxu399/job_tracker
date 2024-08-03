// for delete button in the table
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all delete buttons
    const deleteButtons = document.querySelectorAll('.delete-job-posting');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const jobID = this.getAttribute('data-id');
            deleteJobPosting(jobID);
        });
    });
});

function deleteJobPosting(jobID) {
    console.log('Attempting to delete job posting with ID:', jobID);

    fetch(`/jobPostings/delete-job-posting-ajax`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: jobID }),
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.text().then(text => {
            try {
                return { status: response.status, body: JSON.parse(text) };
            } catch (e) {
                console.error('Received non-JSON response:', text);
                return { status: response.status, body: text };
            }
        });
    })
    .then(({status, body}) => {
        if (status === 200) {
            console.log('Delete successful:', body);
            deleteRow(jobID);
        } else {
            console.error('Error:', body);
            throw new Error(body.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteRow(jobID) {
    const row = document.querySelector(`tr[data-id="${jobID}"]`);
    if (row) {
        row.remove();
    } else {
        console.error('Row not found for job ID:', jobID);
    }
}