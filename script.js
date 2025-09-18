// --- PET INFO ---
const petInfoForm = document.getElementById('petInfoForm');
const petType = document.getElementById('petType');
const breedSelect = document.getElementById('petBreed');
const petInfoContent = document.getElementById('petInfoContent');

let petInfo = JSON.parse(localStorage.getItem('petInfo')) || {};

// Display pet info in the summary div
function displayPetInfo() {
    if (!petInfo || !petInfo.type) {
        petInfoContent.innerHTML = "No pet info saved yet.";
        petInfoForm.style.display = 'block';
        return;
    }

    petInfoContent.innerHTML = `
      <strong>Type:</strong> ${petInfo.type}<br>
      <strong>Age:</strong> ${petInfo.age}<br>
      <strong>Breed:</strong> ${petInfo.breed || "—"}<br>
      <strong>Surgery:</strong> ${petInfo.surgeryType}<br>
      <strong>Reason / Notes:</strong> ${petInfo.surgeryReason || "—"}<br>
      <button type="button" id="editPetInfo">Edit Pet Info</button>
    `;

    // Hide form since info exists
    petInfoForm.style.display = 'none';

    // Add click listener to show form again
    document.getElementById('editPetInfo').addEventListener('click', () => {
        petInfoForm.style.display = 'block';
        // Prefill form with existing data
        petType.value = petInfo.type;
        document.getElementById('petAge').value = petInfo.age;
        breedSelect.value = petInfo.breed;
        document.getElementById('surgeryType').value = petInfo.surgeryType;
        document.getElementById('surgeryReason').value = petInfo.surgeryReason;
    });
}

// Save pet info
petInfoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    petInfo = {
        type: petType.value,
        age: document.getElementById('petAge').value,
        breed: breedSelect.value,
        surgeryType: document.getElementById('surgeryType').value,
        surgeryReason: document.getElementById('surgeryReason').value
    };
    localStorage.setItem('petInfo', JSON.stringify(petInfo));
    displayPetInfo();
    alert("Pet info saved!");
});

// Show/hide breed dropdown (optional for dog/cat)
petType.addEventListener('change', function() {
    breedSelect.parentElement.style.display = this.value === 'Dog' ? 'block' : 'block'; // always visible now
});

// Fetch dog breeds from API
function loadDogBreeds() {
    fetch('https://dog.ceo/api/breeds/list/all')
        .then(res => res.json())
        .then(data => {
            const breeds = Object.keys(data.message).sort();
            breeds.forEach(b => {
                const option = document.createElement('option');
                option.value = b;
                option.textContent = b.charAt(0).toUpperCase() + b.slice(1);
                breedSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading dog breeds:", err));
}
loadDogBreeds();

// --- DAILY LOG ---
const form = document.getElementById('logForm');
const logList = document.getElementById('logList');
const photoInput = document.getElementById('photo');

let logs = JSON.parse(localStorage.getItem('petLogs')) || [];

// Display logs
function displayLogs() {
    logList.innerHTML = "";
    logs.forEach((log) => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
          <strong>Date:</strong> ${log.date}<br>
          <strong>Food:</strong> ${log.food}<br>
          <strong>Medicine:</strong> ${log.medName || "—"} ${log.medDosage ? `(${log.medDosage} mg x ${log.medTimes}/day)` : ""}<br>
          <strong>Energy:</strong> ${log.energy}<br>
          <strong>Notes:</strong> ${log.notes || "—"}<br>
          ${log.photo ? `<img src="${log.photo}" alt="Pet Photo">` : ''}
        `;
        logList.appendChild(div);
    });
}

// Highlight field briefly when copied from yesterday
function highlightField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.classList.add('copied');
    setTimeout(() => input.classList.remove('copied'), 1500);
}

// Individual "same as yesterday"
document.querySelectorAll('.same-btn').forEach(button => {
    button.addEventListener('click', function() {
        if (!logs.length) return;
        const field = this.dataset.field;
        const input = document.getElementById(field);
        if (!input) return;
        input.value = logs[logs.length - 1][field] || "";
        highlightField(field);
    });
});

// "Everything same as yesterday"
document.getElementById('sameAll').addEventListener('click', function() {
    if (!logs.length) return;
    const lastLog = logs[logs.length - 1];
    const fields = ['food','medName','medDosage','medTimes','energy','notes'];
    fields.forEach(field => {
        const input = document.getElementById(field);
        if(input) {
            input.value = lastLog[field] || "";
            highlightField(field);
        }
    });
});

// Add new log
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const file = photoInput.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            saveLog(event.target.result);
        }
        reader.readAsDataURL(file);
    } else {
        saveLog(null);
    }
});

function saveLog(photoData) {
    const newLog = {
        date: document.getElementById('date').value,
        food: document.getElementById('food').value,
        medName: document.getElementById('medName').value,
        medDosage: document.getElementById('medDosage').value,
        medTimes: document.getElementById('medTimes').value,
        energy: document.getElementById('energy').value,
        notes: document.getElementById('notes').value,
        photo: photoData
    };
    logs.push(newLog);
    localStorage.setItem('petLogs', JSON.stringify(logs));
    displayLogs();
    form.reset();
}

// --- AI SECTION ---
const aiForm = document.getElementById('aiForm');
const aiQuestion = document.getElementById('aiQuestion');
const aiAnswer = document.getElementById('aiAnswer');
const aiOption = document.getElementById('aiOption');

aiOption.addEventListener('change', function() {
    aiQuestion.disabled = this.value !== 'question';
});

aiForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const option = aiOption.value;
    const recentLogs = logs.slice(-7).map(log => {
        return `${log.date}: Food ${log.food}, Meds ${log.medName || "—"} ${log.medDosage ? `(${log.medDosage} mg x ${log.medTimes}/day)` : ""}, Energy ${log.energy}, Notes: ${log.notes || "—"}, Photo ${log.photo ? "uploaded" : "none"}`;
    }).join("\n");

    let prompt = `Pet: ${petInfo.type || "Unknown"} (${petInfo.age || "?"} years, ${petInfo.breed || "Unknown breed"})\nSurgery: ${petInfo.surgeryType || "Unknown"}\nReason: ${petInfo.surgeryReason || "—"}\n\nRecovery logs (last 7 days):\n${recentLogs}\n`;

    if(option === 'question') {
        const question = aiQuestion.value.trim();
        if(!question) return;
        prompt += `Owner question: "${question}"`;
    } else {
        prompt += "Please provide a recovery analysis based on the logs.";
    }

    aiAnswer.innerText = "Preparing AI response...\n\n" + prompt;
    aiQuestion.value = "";
});

// --- RESET FUNCTION ---
function resetAllData() {
    if(confirm("Are you sure you want to clear all pet info and logs?")) {
        localStorage.removeItem('petInfo');
        localStorage.removeItem('petLogs');
        petInfo = {};
        logs = [];
        petInfoContent.innerText = "No pet info saved yet.";
        displayLogs();
        petInfoForm.reset();
        form.reset();
        petInfoForm.style.display = 'block'; // show form again
        alert("All data cleared!");
    }
}

// Initial display
displayPetInfo();
displayLogs();
