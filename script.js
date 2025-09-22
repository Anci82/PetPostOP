/* ============================
  LOGIN / REGISTER HEADER HANDLERS
============================ */
const headerRight = document.getElementById('headerRight');
const welcomeSection = document.getElementById('welcomeSection');
const dashboardSection = document.getElementById('dashboard');

// Hardcoded user for now
const validUser = { username: 'admin', password: 'admin' };

// Function to render pre-login header (inputs + buttons)
function renderPreLoginHeader() {
    headerRight.innerHTML = `
        <div class="login-group">
            <input type="text" id="loginUsername" placeholder="Username" />
            <input type="password" id="loginPassword" placeholder="Password" />
        </div>
        <div class="btn-group">
            <button id="loginBtn" class="primary-btn">Log In</button>
            <button id="registerBtn" class="secondary-btn">Register</button>
        </div>
    `;

    // Attach event listeners to the new elements
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', () => {
        alert('Register clicked! (To be implemented)');
    });
}

// Function to handle login click
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (username === validUser.username && password === validUser.password) {
        // Hide welcome, show dashboard
        welcomeSection.style.display = 'none';
        dashboardSection.style.display = 'block';

        // Render post-login header: user icon + sign out
        renderPostLoginHeader();
    } else {
        alert('Invalid username or password');
    }
}

// Function to render post-login header
function renderPostLoginHeader() {
    headerRight.innerHTML = `
        <span class="user-icon">👤</span>
        <button id="signOutBtn" class="secondary-btn">Sign Out</button>
    `;

    // Sign out handler
    document.getElementById('signOutBtn').addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        welcomeSection.style.display = 'block';
        renderPreLoginHeader();
    });
}

// Initialize header on page load
renderPreLoginHeader();

/* ============================
  PET INFO SECTION
============================ */
const petInfoForm = document.getElementById('petInfoForm');
const petType = document.getElementById('petType');
const breedSelect = document.getElementById('petBreed');
const petInfoContent = document.getElementById('petInfoContent');

let petInfo = JSON.parse(localStorage.getItem('petInfo')) || {};

function displayPetInfo() {
    if (!petInfo.type) {
        document.getElementById('petInfoDisplay').style.display = 'none';
        document.getElementById('petInfoWrapper').style.display = 'block';
        return;
    }

    petInfoContent.innerHTML = `
      <strong>Type:</strong> ${petInfo.type}<br>
      <strong>Name:</strong> ${petInfo.name || "—"}<br>
      <strong>Age:</strong> ${petInfo.age}<br>
      <strong>Breed:</strong> ${petInfo.breed || "—"}<br>
      <strong>Weight:</strong> ${petInfo.weight || "—"}<br>
      <strong>Surgery:</strong> ${petInfo.surgeryType}<br>
      <strong>Reason / Notes:</strong> ${petInfo.surgeryReason || "—"}<br>
      <button type="button" id="editPetInfo" class="primary-btn">Edit Pet Info</button>
    `;

    document.getElementById('petInfoWrapper').style.display = 'none';

    document.getElementById('editPetInfo').addEventListener('click', () => {
        document.getElementById('petInfoWrapper').style.display = 'block';
        petType.value = petInfo.type;
        document.getElementById('petName').value = petInfo.name || '';
        document.getElementById('petAge').value = petInfo.age;
        document.getElementById('weight').value = petInfo.weight;
        breedSelect.value = petInfo.breed;
        document.getElementById('surgeryType').value = petInfo.surgeryType;
        document.getElementById('surgeryReason').value = petInfo.surgeryReason;
    });
}

petInfoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    petInfo = {
        type: petType.value,
        name: document.getElementById('petName').value,
        age: document.getElementById('petAge').value,
        weight: document.getElementById('weight').value,
        breed: breedSelect.value,
        surgeryType: document.getElementById('surgeryType').value,
        surgeryReason: document.getElementById('surgeryReason').value
    };
    localStorage.setItem('petInfo', JSON.stringify(petInfo));
    displayPetInfo();
    alert("Pet info saved!");
});

/* ============================
  LOAD DOG BREEDS
============================ */
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

/* ============================
  DAILY LOG SECTION
============================ */
const form = document.getElementById('logForm');
const logList = document.getElementById('logList');
const photoInput = document.getElementById('photo');

let logs = JSON.parse(localStorage.getItem('petLogs')) || [];

// Add medication row
document.getElementById('add-med').addEventListener('click', () => {
    const wrapper = document.getElementById('medications-wrapper');
    const firstRow = wrapper.querySelector('.med-row');
    const newRow = firstRow.cloneNode(true);
    newRow.querySelectorAll('input').forEach(input => input.value = '');
    wrapper.appendChild(newRow);
});

// Display logs
function displayLogs() {
    logList.innerHTML = "";
    logs.forEach((log, idx) => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
          <strong>Date:</strong> ${log.date}<br>
          <strong>Food:</strong> ${log.food}<br>
          <strong>Medicine:</strong> ${log.medName || "—"} ${log.medDosage ? `(${log.medDosage} mg x ${log.medTimes}/day)` : ""}<br>
          <strong>Energy:</strong> ${log.energy}<br>
          <strong>Notes:</strong> ${log.notes || "—"}<br>
          ${log.photo ? `<img src="${log.photo}" alt="Pet Photo">` : ''}<br>
          <button type="button" class="edit-log-btn" data-index="${idx}">Edit</button>
        `;
        logList.appendChild(div);
    });

    // Edit log functionality
    document.querySelectorAll('.edit-log-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = this.dataset.index;
            const log = logs[idx];
            document.getElementById('date').value = log.date;
            document.getElementById('food').value = log.food;
            document.getElementById('energy').value = log.energy;
            document.getElementById('notes').value = log.notes;
            photoInput.value = '';
            logs.splice(idx, 1);
            localStorage.setItem('petLogs', JSON.stringify(logs));
            displayLogs();
        });
    });
}

// Add new log
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const medRows = document.querySelectorAll('#medications-wrapper .med-row');
    const medNames = [];
    const medDosages = [];
    const medTimes = [];
    medRows.forEach(row => {
        medNames.push(row.querySelector('.medName').value);
        medDosages.push(row.querySelector('.medDosage').value);
        medTimes.push(row.querySelector('.medTimes').value);
    });

    const file = photoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            saveLog(event.target.result, medNames, medDosages, medTimes);
        }
        reader.readAsDataURL(file);
    } else {
        saveLog(null, medNames, medDosages, medTimes);
    }
});

// Save log helper
function saveLog(photoData, medNames, medDosages, medTimes) {
    const newLog = {
        date: document.getElementById('date').value,
        food: document.getElementById('food').value,
        medName: medNames.join(', '),
        medDosage: medDosages.join(', '),
        medTimes: medTimes.join(', '),
        energy: document.getElementById('energy').value,
        notes: document.getElementById('notes').value,
        photo: photoData
    };
    logs.push(newLog);
    localStorage.setItem('petLogs', JSON.stringify(logs));
    displayLogs();
    form.reset();
}

/* ============================
  AI SECTION
============================ */
const aiForm = document.getElementById('aiForm');
const aiQuestion = document.getElementById('aiQuestion');
const aiAnswer = document.getElementById('aiAnswer');
const aiOption = document.getElementById('aiOption');

aiOption.addEventListener('change', function () {
    aiQuestion.disabled = this.value !== 'question';
});

aiForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const option = aiOption.value;
    const recentLogs = logs.slice(-7).map(log => {
        return `${log.date}: Food ${log.food}, Meds ${log.medName || "—"} ${log.medDosage ? `(${log.medDosage} mg x ${log.medTimes}/day)` : ""}, Energy ${log.energy}, Notes: ${log.notes || "—"}, Photo ${log.photo ? "uploaded" : "none"}`;
    }).join("\n");

    let prompt = `Pet: ${petInfo.type || "Unknown"} (${petInfo.age || "?"} years, ${petInfo.breed || "Unknown breed"})\nSurgery: ${petInfo.surgeryType || "Unknown"}\nReason: ${petInfo.surgeryReason || "—"}\n\nRecovery logs (last 7 days):\n${recentLogs}\n`;

    if (option === 'question') {
        const question = aiQuestion.value.trim();
        if (!question) return;
        prompt += `Owner question: "${question}"`;
    } else {
        prompt += "Please provide a recovery analysis based on the logs.";
    }

    aiAnswer.innerText = "Preparing AI response...\n\n" + prompt;
    aiQuestion.value = "";
});

/* ============================
  RESET SECTION
============================ */
function resetAllData() {
    if (confirm("Are you sure you want to clear all pet info and logs?")) {
        localStorage.removeItem('petInfo');
        localStorage.removeItem('petLogs');
        petInfo = {};
        logs = [];
        petInfoContent.innerText = "No pet info saved yet.";
        displayLogs();
        petInfoForm.reset();
        form.reset();
        document.getElementById('petInfoWrapper').style.display = 'block';
        alert("All data cleared!");
    }
}

/* ============================
  INITIALIZE
============================ */
displayPetInfo();
displayLogs();
