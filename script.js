/* ============================
   LOGIN / HEADER
============================ */
const headerRight = document.getElementById('headerRight');
const welcomeSection = document.getElementById('welcomeSection');
const dashboardSection = document.getElementById('dashboard');

const validUser = { username: 'admin', password: 'admin' };

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
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', () => {
        alert('Register clicked! (To be implemented)');
    });
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (username === validUser.username && password === validUser.password) {
        welcomeSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        renderPostLoginHeader();
        displayPetInfo();
        displayLogs();
    } else {
        alert('Invalid username or password');
    }
}

function renderPostLoginHeader() {
    headerRight.innerHTML = `
        <span class="user-icon">👤</span>
        <button id="signOutBtn" class="secondary-btn">Sign Out</button>
    `;
    document.getElementById('signOutBtn').addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        welcomeSection.style.display = 'block';
        renderPreLoginHeader();
    });
}
// HIDING HEADER
let lastScroll = 0;
const header = document.querySelector('.header-wrapper');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 50) {
    // scrolling down → hide header
    header.classList.add('hidden');
  } else {
    // scrolling up → show header
    header.classList.remove('hidden');
  }

  lastScroll = currentScroll;
});


renderPreLoginHeader();

/* ============================
   PET INFO
============================ */
const petInfoForm = document.getElementById('petInfoForm');
const petType = document.getElementById('petType');
const breedSelect = document.getElementById('petBreed');
const petInfoContent = document.getElementById('petInfoContent');
const petInfoWrapper = document.getElementById('petInfoWrapper');
const petInfoDisplay = document.getElementById('petInfoDisplay');
const rightBoxes = document.getElementById('rightBoxes');

let petInfo = JSON.parse(localStorage.getItem('petInfo')) || {};

function displayPetInfo() {
    if (!petInfo.type) {
        petInfoWrapper.style.display = 'block';
        petInfoDisplay.style.display = 'none';
        rightBoxes.style.display = 'none';
        document.getElementById('logHistoryDisplay').style.display = 'none';
        backPetBtn.style.display = 'none';
        return;
    }
    backPetBtn.style.display = 'inline-block';
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

    petInfoWrapper.style.display = 'none';
    petInfoDisplay.style.display = 'block';
    rightBoxes.style.display = 'flex';
    document.getElementById('logHistoryDisplay').style.display = 'block';

    document.getElementById('editPetInfo').addEventListener('click', () => {
        petInfoWrapper.style.display = 'block';
        petType.value = petInfo.type;
        document.getElementById('petName').value = petInfo.name || '';
        document.getElementById('petAge').value = petInfo.age;
        document.getElementById('weight').value = petInfo.weight;
        breedSelect.value = petInfo.breed;
        document.getElementById('surgeryType').value = petInfo.surgeryType;
        document.getElementById('surgeryReason').value = petInfo.surgeryReason;
        petInfoDisplay.style.display = 'none';
        rightBoxes.style.display = 'none';
        document.getElementById('logHistoryDisplay').style.display = 'none';
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
   DAILY LOGS
============================ */
// Helper function to resize an image and return a data URL
function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height));
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // adjust quality if needed
            callback(resizedDataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

const logForm = document.getElementById('logForm');
const addLogBtn = document.getElementById('add-log-btn');
const dailyLogWrapper = document.getElementById('dailyLogWrapper');
const photoInput = document.getElementById('photo');

let logs = JSON.parse(localStorage.getItem('petLogs')) || [];
let editIndex = null;

// Add medication row
document.getElementById('add-med').addEventListener('click', () => {
    const wrapper = document.getElementById('medications-wrapper');
    const firstRow = wrapper.querySelector('.med-row');
    const newRow = firstRow.cloneNode(true);
    newRow.querySelectorAll('input').forEach(input => input.value = '');
    wrapper.appendChild(newRow);
});

function displayLogs() {
    const logList = document.getElementById('logList');
    logList.innerHTML = '';

    logs.forEach((log, idx) => {
        const medStr = log.meds.map(m => `${m.name || "—"} (${m.dosage || 0}mg x ${m.times || 0})`).join(', ');

        const div = document.createElement('div');
        div.className = 'log-entry';

        div.innerHTML = `
            <div class="log-header">
                <span>${log.date}</span>
                <span>▶</span>
            </div>
            <div class="log-content">
                <strong>Food:</strong> ${log.food}<br>
                <strong>Medicine:</strong> ${medStr}<br>
                <strong>Energy:</strong> ${log.energy}<br>
                <strong>Notes:</strong> ${log.notes || "—"}<br>
                ${log.photo ? `<img src="${log.photo}" alt="Pet Photo" class="log-photo">` : ''}<br>
                <button type="button" class="primary-btn edit-log-btn" data-index="${idx}">Edit</button>
            </div>
        `;

        // toggle collapse
        div.querySelector('.log-header').addEventListener('click', () => {
            div.classList.toggle('active');
        });

        logList.appendChild(div);
    });

    // reattach edit buttons
    document.querySelectorAll('.edit-log-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent toggling when editing
            const idx = btn.dataset.index;
            const log = logs[idx];
            editIndex = idx;
            addLogBtn.innerText = 'Done';
            showForm(dailyLogWrapper);

            document.getElementById('date').value = log.date;
            document.getElementById('food').value = log.food;
            document.getElementById('energy').value = log.energy;
            document.getElementById('notes').value = log.notes || '';
            photoInput.value = '';

            const wrapper = document.getElementById('medications-wrapper');
            wrapper.innerHTML = '';
            log.meds.forEach(med => {
                const row = document.createElement('div');
                row.className = 'med-row flex-row';
                row.innerHTML = `
                    <input type="text" class="medName" placeholder="Medicine Name" value="${med.name || ''}">
                    <input type="number" class="medDosage" placeholder="Dosage (mg)" value="${med.dosage || ''}">
                    <input type="number" class="medTimes" placeholder="Times per Day" value="${med.times || ''}">
                `;
                wrapper.appendChild(row);
            });
        });
    });
}


logForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const medRows = document.querySelectorAll('#medications-wrapper .med-row');
    const meds = Array.from(medRows).map(row => ({
        name: row.querySelector('.medName').value,
        dosage: row.querySelector('.medDosage').value,
        times: row.querySelector('.medTimes').value
    }));

    const file = photoInput.files[0];

    const finalizeLog = (photoData) => {
        const newLog = {
            date: document.getElementById('date').value,
            food: document.getElementById('food').value,
            energy: document.getElementById('energy').value,
            notes: document.getElementById('notes').value,
            meds,
            photo: photoData || (editIndex !== null ? logs[editIndex].photo : null)
        };

        if (editIndex !== null) {
            logs[editIndex] = newLog;
            editIndex = null;
        } else {
            logs.push(newLog);
        }

        localStorage.setItem('petLogs', JSON.stringify(logs));
        displayLogs();
        logForm.reset();
        addLogBtn.innerText = 'Add Log';

        // Reset meds
        const wrapper = document.getElementById('medications-wrapper');
        wrapper.innerHTML = '';
        const firstRow = document.createElement('div');
        firstRow.className = 'med-row flex-row';
        firstRow.innerHTML = `
            <input type="text" class="medName" placeholder="Medicine Name">
            <input type="number" class="medDosage" placeholder="Dosage (mg)">
            <input type="number" class="medTimes" placeholder="Times per Day">
        `;
        wrapper.appendChild(firstRow);

        dailyLogWrapper.style.display = 'none';
        displayPetInfo();
    }

    if (file) {
    resizeImage(file, 300, 300, (resizedPhoto) => { // 300x300 is preview size
        finalizeLog(resizedPhoto);
    });
} else {
    finalizeLog(null);
}
});
// COPY OF LOGS

const copyAllBtn = document.getElementById('copyAllBtn');

copyAllBtn.addEventListener('click', () => {
    if (logs.length === 0) return alert("No previous logs to copy!");

    const lastLog = logs[logs.length - 1];

    document.getElementById('food').value = lastLog.food;
    document.getElementById('energy').value = lastLog.energy;
    document.getElementById('notes').value = lastLog.notes || '';

    // Clear current med rows
    const wrapper = document.getElementById('medications-wrapper');
    wrapper.innerHTML = '';

    // Populate meds from last log
    lastLog.meds.forEach(med => {
        const row = document.createElement('div');
        row.className = 'med-row flex-row';
        row.innerHTML = `
            <input type="text" class="medName" placeholder="Medicine Name" value="${med.name || ''}">
            <input type="number" class="medDosage" placeholder="Dosage (mg)" value="${med.dosage || ''}">
            <input type="number" class="medTimes" placeholder="Times per Day" value="${med.times || ''}">
        `;
        wrapper.appendChild(row);
    });

    alert("Copied last log's data!");
});

// ============================
// AI SECTION
// ============================
const aiForm = document.getElementById('aiForm');
const aiQuestion = document.getElementById('aiQuestion');
const aiAnswer = document.getElementById('aiAnswer');
const aiOption = document.getElementById('aiOption');
const aiSection = document.getElementById('aiSection');

aiOption.addEventListener('change', function () {
    aiQuestion.disabled = this.value !== 'question';
});

aiForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const option = aiOption.value;
    const recentLogs = logs.slice(-7).map(log => {
        const meds = log.meds.map(m => `${m.name || "—"} (${m.dosage || 0}mg x ${m.times || 0})`).join(', ');
        return `${log.date}: Food ${log.food}, Meds ${meds}, Energy ${log.energy}, Notes: ${log.notes || "—"}, Photo ${log.photo ? "uploaded" : "none"}`;
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


// ============================
// RESET ALL DATA
// ============================
function resetAllData() {
    if (confirm("Are you sure you want to clear all pet info and logs?")) {
        localStorage.removeItem('petInfo');
        localStorage.removeItem('petLogs');
        petInfo = {};
        logs = [];
        petInfoContent.innerText = "No pet info saved yet.";
        displayLogs();
        petInfoForm.reset();
        logForm.reset();
        petInfoWrapper.style.display = 'block';
        rightBoxes.style.display = 'none';
        alert("All data cleared!");
    }
}

// ============================
// DASHBOARD FORM LOGIC
// ============================
const showLogFormBtn = document.getElementById('showLogFormBtn');
const showAIFormBtn = document.getElementById('showAIFormBtn');
const exitLogBtn = document.getElementById('exitLogBtn');
const exitAIBtn = document.getElementById('exitAIBtn');
const backPetBtn = document.getElementById('exitPetInfoBtn');

dailyLogWrapper.style.display = 'none';
aiSection.style.display = 'none';

function showForm(formElement) {
    rightBoxes.style.display = 'none';
    dailyLogWrapper.style.display = 'none';
    aiSection.style.display = 'none';
    petInfoWrapper.style.display = 'none';
    petInfoDisplay.style.display = 'none';
    const logHistoryDisplay = document.getElementById('logHistoryDisplay');
    if (logHistoryDisplay) logHistoryDisplay.style.display = 'none';
    formElement.style.display = 'block';
    window.scrollTo({ top: formElement.offsetTop, behavior: 'smooth' });
}

showLogFormBtn.addEventListener('click', () => showForm(dailyLogWrapper));
showAIFormBtn.addEventListener('click', () => showForm(aiSection));

exitLogBtn.addEventListener('click', () => {
    dailyLogWrapper.style.display = 'none';
    editIndex = null; // cancel any editing
    displayPetInfo();
    displayLogs();
});
backPetBtn.addEventListener('click', () => {
    // Cancel editing
    editIndex = null;

    // Restore form values from saved petInfo
    petType.value = petInfo.type || '';
    document.getElementById('petName').value = petInfo.name || '';
    document.getElementById('petAge').value = petInfo.age || '';
    document.getElementById('weight').value = petInfo.weight || '';
    breedSelect.value = petInfo.breed || '';
    document.getElementById('surgeryType').value = petInfo.surgeryType || '';
    document.getElementById('surgeryReason').value = petInfo.surgeryReason || '';

    petInfoWrapper.style.display = 'none';
    displayPetInfo();
    displayLogs();
});

exitAIBtn.addEventListener('click', () => {
    aiSection.style.display = 'none';
    // ✅ restore everything dashboard-related
    displayPetInfo();
    displayLogs(); // optional, just to be sure logs are up to date
});

// INITIALIZE
displayPetInfo();
displayLogs();
