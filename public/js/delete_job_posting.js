// delete_job_posting.js

// Add event listener for delete buttons with confirmation prompt
document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-job-posting');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteButtonClick);
    });
});


function handleDeleteButtonClick(event) {
    event.preventDefault();
    const button = this;
    const jobId = button.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this job posting?')) {
        console.log("Deleting job ID:", jobId);
        deleteJobPosting(jobId);
    }
}

function deleteJobPosting(id) {
    console.log("Sending DELETE request for job ID:", id);
    fetch(`/jobPostings/delete-job-posting/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (response.ok) {
            console.log("Job posting deleted successfully:", id);
            const row = document.querySelector(`tr[data-id='${id}']`);
            if (row) {
                row.remove();
            }
        } else {
            response.json().then(data => {
                console.error("Failed to delete job posting:", data.error); // Debugging log
                alert(`Failed to delete the job posting: ${data.error}`);
            }).catch(error => {
                console.error('Error parsing response:', error);
                alert('Failed to delete the job posting.');
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

  function loadJobPostingData(id) {
    // Load job posting data into the update modal (AJAX request)
  }