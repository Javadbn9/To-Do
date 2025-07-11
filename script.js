document.getElementById('addBtn').addEventListener('click', addReminder);
document.getElementById('reminderInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addReminder();
});
document.getElementById('micBtn').addEventListener('click', toggleSpeechRecognition);
document.getElementById('languageSelect').addEventListener('change', updateLanguage);
document.addEventListener('DOMContentLoaded', () => {
  loadReminders();
  updateLanguage();
});

let recognition;
let isRecording = false;

const translations = {
  fa: {
    title: 'یادآور من',
    placeholder: 'یادآوری خود را وارد کنید...',
    addButton: 'اضافه کن',
    deleteButton: 'حذف',
    emptyInput: 'لطفاً یک یادآوری وارد کنید!',
    noSpeechSupport: 'مرورگر شما از تشخیص صدا پشتیبانی نمی‌کند. لطفاً از مرورگر کروم استفاده کنید.',
    speechError: 'خطا در تشخیص صدا: ',
  },
  en: {
    title: 'My Reminders',
    placeholder: 'Enter your reminder...',
    addButton: 'Add',
    deleteButton: 'Delete',
    emptyInput: 'Please enter a reminder!',
    noSpeechSupport: 'Your browser does not support speech recognition. Please use Chrome.',
    speechError: 'Speech recognition error: ',
  }
};

function updateLanguage() {
  const lang = document.getElementById('languageSelect').value;
  const html = document.documentElement;
  const title = document.getElementById('title');
  const input = document.getElementById('reminderInput');
  const addBtn = document.getElementById('addBtn');

  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');

  title.textContent = translations[lang].title;
  input.placeholder = translations[lang].placeholder;
  addBtn.textContent = translations[lang].addButton;

  document.querySelectorAll('#reminderList li button.delete').forEach(button => {
    button.textContent = translations[lang].deleteButton;
  });
}

function toggleSpeechRecognition() {
  const micBtn = document.getElementById('micBtn');
  const input = document.getElementById('reminderInput');
  const lang = document.getElementById('languageSelect').value;

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert(translations[lang].noSpeechSupport);
    return;
  }

  if (!isRecording) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = lang === 'fa' ? 'fa-IR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      addReminder();
    };

    recognition.onerror = function(event) {
      alert(translations[lang].speechError + event.error);
      micBtn.classList.remove('recording');
      isRecording = false;
    };

    recognition.onend = function() {
      micBtn.classList.remove('recording');
      isRecording = false;
    };

    recognition.start();
    micBtn.classList.add('recording');
    isRecording = true;
  } else {
    recognition.stop();
    micBtn.classList.remove('recording');
    isRecording = false;
  }
}

function addReminder() {
  const input = document.getElementById('reminderInput');
  const reminderText = input.value.trim();
  const reminderList = document.getElementById('reminderList');
  const lang = document.getElementById('languageSelect').value;

  if (!reminderText) {
    alert(translations[lang].emptyInput);
    return;
  }

  const li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox" class="mr-2" onchange="toggleReminder(this)">
    <span>${reminderText}</span>
    <button class="delete text-red-500 hover:text-red-700" onclick="deleteReminder(this)">${translations[lang].deleteButton}</button>
  `;
  reminderList.appendChild(li);

  saveReminder({ text: reminderText, completed: false });

  input.value = '';
}

function toggleReminder(checkbox) {
  const li = checkbox.parentElement;
  const span = li.querySelector('span');
  const reminderText = span.textContent;
  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const reminder = reminders.find(r => r.text === reminderText);
  reminder.completed = checkbox.checked;
  span.classList.toggle('line-through', reminder.completed);
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

function deleteReminder(button) {
  const li = button.parentElement;
  const reminderText = li.querySelector('span').textContent;
  li.remove();

  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders = reminders.filter(reminder => reminder.text !== reminderText);
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

function saveReminder(reminder) {
  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders.push(reminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

function loadReminders() {
  const reminderList = document.getElementById('reminderList');
  const lang = document.getElementById('languageSelect').value;
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');

  reminders.forEach(reminder => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" class="mr-2" onchange="toggleReminder(this)" ${reminder.completed ? 'checked' : ''}>
      <span class="${reminder.completed ? 'line-through' : ''}">${reminder.text}</span>
      <button class="delete text-red-500 hover:text-red-700" onclick="deleteReminder(this)">${translations[lang].deleteButton}</button>
    `;
    reminderList.appendChild(li);
  });
}