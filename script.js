const form = document.getElementById('logForm');
const logList = document.getElementById('logList');
const photoInput = document.getElementById('photo');

let logs = JSON.parse(localStorage.getItem('petLogs')) || [];

function displayLogs() {
  logList.innerHTML = "";
  logs.forEach((log) => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `
      <strong>Date:</strong> ${log.date}<br>
      <strong>Food:</strong> ${log.food}<br>
      <strong>Meds:</strong> ${log.meds}<br>
      <strong>Energy:</strong> ${log.energy}<br>
      <strong>Notes:</strong> ${log.notes || "—"}<br>
      ${log.photo ? `<img src="${log.photo}" alt="Pet Photo">` : ''}
    `;
    logList.appendChild(div);
  });
}

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const file = photoInput.files[0];

  if (file) {
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
    meds: document.getElementById('meds').value,
    energy: document.getElementById('energy').value,
    notes: document.getElementById('notes').value,
    photo: photoData
  };

  logs.push(newLog);
  localStorage.setItem('petLogs', JSON.stringify(logs));

  displayLogs();
  form.reset();
}

const aiForm = document.getElementById('aiForm');
const aiQuestion = document.getElementById('aiQuestion');
const aiAnswer = document.getElementById('aiAnswer');

aiForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const question = aiQuestion.value;
  if (!question) return;

  // Prepare a summary of last 7 logs
  const recentLogs = logs.slice(-7).map(log => {
    return `${log.date}: Food ${log.food}, Meds ${log.meds}, Energy ${log.energy}, Notes: ${log.notes || "—"}, Photo ${log.photo ? "uploaded" : "none"}`;
  }).join("\n");

  const prompt = `Pet: Rita
Recovery logs (last 7 days):
${recentLogs}
Owner question: "${question}"`;

  // For now, just display prompt (later send to AI API)
  aiAnswer.innerText = "Preparing AI response...\n\n" + prompt;

  aiQuestion.value = "";
});

