// delete_skill_plan.js

// Add event listener for delete buttons with confirmation prompt
document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-skill-plan');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteButtonClick);
    });
});

function handleDeleteButtonClick(event) {
    event.preventDefault();
    const button = this;
    const planId = button.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this skill plan?')) {
        console.log("Deleting skill plan ID:", planId);
        deleteSkillPlan(planId);
    }
}

function deleteSkillPlan(id) {
    console.log("Sending DELETE request for skill plan ID:", id);
    fetch(`/skillPlans/delete-skill-plan/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (response.ok) {
            console.log("Skill plan deleted successfully:", id);
            const row = document.querySelector(`tr[data-id='${id}']`);
            if (row) {
                row.remove();
            }
        } else {
            response.json().then(data => {
                console.error("Failed to delete skill plan:", data.error); // Debugging log
                alert(`Failed to delete the skill plan: ${data.error}`);
            }).catch(error => {
                console.error('Error parsing response:', error);
                alert('Failed to delete the skill plan.');
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

