const entryInput = document.getElementById('entry');
const saveBtn = document.getElementById('saveBtn');
const entriesList = document.getElementById('entriesList');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');

let editingIndex = null;

function getEntries() {
  return JSON.parse(localStorage.getItem('dailyEntries')) || [];
}

function saveEntries(entries) {
  localStorage.setItem('dailyEntries', JSON.stringify(entries));
}

function loadEntries(filter = '') {
  const entries = getEntries();
  entriesList.innerHTML = '';

  entries
    .slice()
    .reverse()
    .filter(e => e.text.toLowerCase().includes(filter.toLowerCase()))
    .forEach(({ text, date }, index) => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'entry';
      entryDiv.innerHTML = `
        <small>${new Date(date).toLocaleString()}</small>

<p>${text}</p>
        <div class="entry-actions">
          <button class="edit-btn" data-index="${entries.length - 1 - index}">Edit</button>
          <button class="delete-btn" data-index="${entries.length - 1 - index}">Delete</button>
        </div>
      `;
      entriesList.appendChild(entryDiv);
    });

  bindEntryButtons();
}

function bindEntryButtons() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const entries = getEntries();
      entryInput.value = entries[index].text;
      editingIndex = index;
      saveBtn.textContent = 'Update Entry';
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const entries = getEntries();
      entries.splice(index, 1);
      saveEntries(entries);
      loadEntries(searchInput.value);
    });
  });
}

saveBtn.addEventListener('click', () => {
  const text = entryInput.value.trim();
  if (text === '') return;

  const entries = getEntries();

  if (editingIndex !== null) {
    entries[editingIndex].text = text;
    entries[editingIndex].date = new Date().toISOString();
    editingIndex = null;
    saveBtn.textContent = 'Save Entry';
  } else {
    entries.push({ text, date: new Date().toISOString() });
  }

  saveEntries(entries);
  entryInput.value = '';
  loadEntries(searchInput.value);
});

searchInput.addEventListener('input', () => {
  loadEntries(searchInput.value);
});

// 🌙 Dark Mode
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// On load, apply saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Initial load
loadEntries();
