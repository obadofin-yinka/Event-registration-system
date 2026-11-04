/**
 * Event Registration System - Main Script
 * Handles form submission, local storage persistence, filtering, and CRUD operations.
 */

// 1. Load saved registrations from the browser
let participants = JSON.parse(localStorage.getItem("eventParticipants")) || [];

// 2. Save registrations in the browser
function saveParticipants() {
    localStorage.setItem("eventParticipants", JSON.stringify(participants));
}

// 3. Display registered participants
function displayParticipants(searchTerm = "") {
    const participantList = document.getElementById("participant-list");
    participantList.replaceChildren();

    const search = searchTerm.toLowerCase();

    const filteredParticipants = participants.filter(function(participant) {
        return (
            participant.fullname.toLowerCase().includes(search) ||
            participant.matric.toLowerCase().includes(search)
        );
    });

    // Handle Empty State
    if (filteredParticipants.length === 0) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        
        emptyCell.colSpan = 5;
        emptyCell.style.textAlign = "center";
        emptyCell.style.color = "#64748b";
        emptyCell.style.padding = "24px";
        emptyCell.textContent = searchTerm ? "No matching participants found." : "No participants registered yet.";
        
        emptyRow.appendChild(emptyCell);
        participantList.appendChild(emptyRow);
    } else {
        filteredParticipants.forEach(function(participant) {
            const row = document.createElement("tr");

            const values = [
                participant.fullname,
                participant.matric,
                participant.email,
                participant.event
            ];

            values.forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            // Create Delete button column
            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            
            // Inline styling tweak to distinguish delete button from main buttons
            deleteButton.style.backgroundColor = "#dc2626";
            deleteButton.style.padding = "6px 12px";
            deleteButton.style.fontSize = "13px";
            
            deleteButton.addEventListener("mouseover", function() {
                deleteButton.style.backgroundColor = "#b91c1c";
            });
            deleteButton.addEventListener("mouseout", function() {
                deleteButton.style.backgroundColor = "#dc2626";
            });

            deleteButton.addEventListener("click", function() {
                deleteParticipant(participant.id);
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            participantList.appendChild(row);
        });
    }

    // Display total registrations count
    document.getElementById("total-participants").textContent = participants.length;
}

// 4. Allow users to select an event via event cards
function selectEvent(eventName) {
    const eventSelect = document.getElementById("event");
    if (eventSelect) {
        eventSelect.value = eventName;
        document.getElementById("registration").scrollIntoView({
            behavior: "smooth"
        });
    }
}

// 5. Process the registration form submission
document.getElementById("registration-form").addEventListener("submit", function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Collect and sanitize form information
    const fullname = document.getElementById("fullname").value.trim();
    const matric = document.getElementById("matric").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const selectedEvent = document.getElementById("event").value;
    const message = document.getElementById("message");

    // Clear previous message states
    message.style.color = "";

    // Validation checks
    if (!fullname || !matric || !email || !phone || !selectedEvent) {
        message.textContent = "Please fill out all required fields correctly.";
        message.style.color = "#dc2626";
        return;
    }

    // Check whether this matriculation number is already registered
    const alreadyRegistered = participants.some(function(participant) {
        return participant.matric.toLowerCase() === matric.toLowerCase();
    });

    if (alreadyRegistered) {
        message.textContent = "This matriculation number has already been registered.";
        message.style.color = "#dc2626";
        return;
    }

    // Create a new participant record
    const newParticipant = {
        id: crypto.randomUUID(),
        fullname: fullname,
        matric: matric,
        email: email,
        phone: phone,
        event: selectedEvent,
        registrationDate: new Date().toISOString().slice(0, 10)
    };

    // Add the participant to our list
    participants.push(newParticipant);

    // Save the updated list to localStorage
    saveParticipants();

    // Refresh the table maintaining search filter context
    const searchInput = document.getElementById("search");
    displayParticipants(searchInput ? searchInput.value.trim() : "");

    // Clear the form
    this.reset();

    // Show success message
    message.textContent = "Registration successful!";
    message.style.color = "#16a34a";

    // Auto-clear success message after 5 seconds
    setTimeout(() => {
        if (message.textContent === "Registration successful!") {
            message.textContent = "";
        }
    }, 5000);
});

// 6. Search for registered participants dynamically
const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", function() {
        displayParticipants(this.value.trim());
    });
}

// 7. Delete a participant record
function deleteParticipant(participantId) {
    const confirmed = confirm("Are you sure you want to delete this registration?");
    
    if (!confirmed) {
        return;
    }

    participants = participants.filter(function(participant) {
        return participant.id !== participantId;
    });

    saveParticipants();

    const currentSearch = document.getElementById("search");
    displayParticipants(currentSearch ? currentSearch.value.trim() : "");

    const message = document.getElementById("message");
    message.textContent = "Registration deleted successfully.";
    message.style.color = "#16a34a";

    setTimeout(() => {
        if (message.textContent === "Registration deleted successfully.") {
            message.textContent = "";
        }
    }, 5000);
}

// 8. Display saved registrations when the page loads
document.addEventListener("DOMContentLoaded", function() {
    displayParticipants();
});
