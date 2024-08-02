// Function to delete a job posting using regular JavaScript/XMLHttpRequest
function deleteJobPosting(jobID) {
    // Data we want to send
    let data = {
        id: jobID
    };
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-job-posting-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Handle the AJAX response
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            // If successful, delete the row from the table
            deleteRow(jobID);
        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.log("There was an error deleting the job posting.")
        }
    }

    // Send the request
    xhttp.send(JSON.stringify(data));
}

// Function to delete the row from the table
function deleteRow(jobID){
    let table = document.getElementById("job-postings-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       if (table.rows[i].getAttribute("data-value") == jobID) {
            table.deleteRow(i);
            deleteDropDownMenu(jobID);
            break;
       }
    }
}

// Function to remove the job posting from any dropdown menus
function deleteDropDownMenu(jobID){
    let selectMenu = document.getElementById("jobSelect");
    for (let i = 0; i < selectMenu.length; i++){
        if (Number(selectMenu.options[i].value) === Number(jobID)){
            selectMenu[i].remove();
            break;
        } 
    }
}