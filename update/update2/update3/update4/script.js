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
      entryDiv.className = 'entry-card';
      entryDiv.innerHTML = `
        <div class="entry-header">
          <small>${new Date(date).toLocaleString()}</small>
          <div class="entry-actions">
            <button class="edit-btn" data-index="${entries.length - 1 - index}" aria-label="Edit entry">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="delete-btn" data-index="${entries.length - 1 - index}" aria-label="Delete entry">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
        <p>${text}</p>
      `;
      entriesList.appendChild(entryDiv);
    });

  lucide.createIcons(); // refresh icons for new elements
  bindEntryButtons();
}

function bindEntryButtons() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const entries = getEntries();
      entryInput.value = entries[index].text;
      editingIndex = index;
      saveBtn.innerHTML = `<i data-lucide="save"></i> Update Entry`;
      lucide.createIcons();
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
    saveBtn.innerHTML = `<i data-lucide="save"></i> Save Entry`;
    lucide.createIcons();
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

// 📥 Download all entries as a .json file
const downloadBtn = document.getElementById('downloadBtn');
const uploadInput = document.getElementById('uploadInput');

downloadBtn.addEventListener('click', () => {
  const entries = getEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `daily-log-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// 📤 Upload a .json file to restore entries
uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedEntries = JSON.parse(text);

    if (!Array.isArray(importedEntries)) throw new Error('Invalid format');

    const confirmed = confirm("Do you want to replace your current entries with this upload?");
    if (confirmed) {
      saveEntries(importedEntries);
      loadEntries(searchInput.value);
      alert('Entries restored successfully!');
    }
  } catch (err) {
    alert('Failed to import data. Make sure it’s a valid backup file.');
    console.error(err);
  }
});
