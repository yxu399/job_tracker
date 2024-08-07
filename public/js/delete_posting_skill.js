// delete_posting_skill.js

// Add event listener for delete buttons with confirmation prompt
document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-posting-skill');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteButtonClick);
    });
});

function handleDeleteButtonClick(event) {
    event.preventDefault();
    const button = this;
    const postingSkillId = button.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this posting skill?')) {
        console.log("Deleting posting skill ID:", postingSkillId);
        deletePostingSkill(postingSkillId);
    }
}

function deletePostingSkill(id) {
    console.log("Sending DELETE request for posting skill ID:", id);
    fetch(`/postingsSkills/delete-posting-skill/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (response.ok) {
            console.log("Posting skill deleted successfully:", id);
            const row = document.querySelector(`tr[data-id='${id}']`);
            if (row) {
                row.remove();
            }
        } else {
            response.json().then(data => {
                console.error("Failed to delete posting skill:", data.error); // Debugging log
                alert(`Failed to delete the posting skill: ${data.error}`);
            }).catch(error => {
                console.error('Error parsing response:', error);
                alert('Failed to delete the posting skill.');
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

function loadPostingSkillData(id) {
    // Load posting skill data into the update modal (AJAX request)
    // This function can be implemented later if needed
}