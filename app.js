console.log("JS connected");

const form = document.getElementById("lostForm");
const status = document.getElementById("formStatus");
const tbody = document.getElementById("lostTbody");

function formatDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(); } catch (e) { return d; }
}

function renderTable() {
  if (!tbody) return;
  const items = JSON.parse(localStorage.getItem("items")) || [];
  tbody.innerHTML = "";

  items.forEach((item, idx) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category || '')}</td>
      <td>${escapeHtml(item.color || '')}</td>
      <td>${escapeHtml(item.brand || '')}</td>
      <td>${escapeHtml(item.place || '')}</td>
      <td>${formatDate(item.date)}</td>
      <td>${escapeHtml(item.contact || '')}</td>
      <td><button class="action-btn" data-idx="${idx}">Delete</button></td>
    `;

    tbody.appendChild(tr);
  });

  // attach delete handlers
  tbody.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.addEventListener('click', function () {
      const i = Number(this.getAttribute('data-idx'));
      let items = JSON.parse(localStorage.getItem('items')) || [];
      items.splice(i, 1);
      localStorage.setItem('items', JSON.stringify(items));
      renderTable();
    });
  });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]; });
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const item = {
      name: (document.getElementById('itemName') || {}).value || '',
      category: (document.getElementById('category') || {}).value || '',
      color: (document.getElementById('color') || {}).value || '',
      brand: (document.getElementById('brand') || {}).value || '',
      serial: (document.getElementById('serial') || {}).value || '',
      description: (document.getElementById('description') || {}).value || '',
      place: (document.getElementById('lostPlace') || {}).value || '',
      date: (document.getElementById('lostDate') || {}).value || '',
      contact: (document.getElementById('contact') || {}).value || ''
    };

    let items = JSON.parse(localStorage.getItem('items')) || [];
    items.unshift(item); // newest first
    localStorage.setItem('items', JSON.stringify(items));

    form.reset();
    if (status) {
      status.textContent = 'Lost item saved locally.';
      setTimeout(() => { status.textContent = ''; }, 2500);
    }
    renderTable();
  });
}

renderTable();