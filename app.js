console.log('GOD\'S EYE — app.js loaded');

// Feed and storage: single `reports` array in localStorage stores both lost and found reports
const feedRoot = document.getElementById('feedList');
const searchInput = document.getElementById('globalSearch');
const exportBtn = document.getElementById('exportCsv');

function loadReports() {
  return JSON.parse(localStorage.getItem('reports') || '[]');
}

function saveReports(r) {
  localStorage.setItem('reports', JSON.stringify(r));
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

function mockMatchScore(item) {
  // simple mock: compute score from text lengths and presence of image
  let score = 40;
  if (item.description) score += Math.min(30, item.description.length/4);
  if (item.image) score += 30;
  return Math.min(99, Math.round(score));
}

function renderFeed(filter) {
  if (!feedRoot) return;
  const reports = loadReports();
  feedRoot.innerHTML = '';
  const q = (filter||'').toLowerCase().trim();

  reports.forEach((r, idx) => {
    const text = `${r.name} ${r.place} ${r.color || ''} ${r.brand || ''} ${r.description || ''}`.toLowerCase();
    if (q && !text.includes(q)) return;

    const card = document.createElement('article');
    card.className = 'feed-card';

    const img = document.createElement('img');
    img.className = 'feed-image';
    img.alt = r.name || 'item';
    img.src = r.image || 'https://via.placeholder.com/220x140/0A0A0A/00E5FF?text=No+Image';

    const details = document.createElement('div');
    details.className = 'feed-details';
    const title = document.createElement('div');
    title.innerHTML = `<strong>${escapeHtml(r.name||'Unnamed')}</strong> <span class="match-badge">${mockMatchScore(r)}%</span>`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${r.type || 'lost'} • ${r.place || ''} • ${r.date || ''}`;
    const desc = document.createElement('div');
    desc.style.marginTop = '8px';
    desc.textContent = r.description || '';

    const actions = document.createElement('div');
    actions.style.marginTop = '10px';
    const viewBtn = document.createElement('button'); viewBtn.textContent = 'View'; viewBtn.className='action-btn';
    const contactBtn = document.createElement('button'); contactBtn.textContent = (r.type==='found')? 'Claim' : 'Contact'; contactBtn.className='action-btn';
    const del = document.createElement('button'); del.textContent = 'Delete'; del.className='action-btn'; del.style.marginLeft='8px';

    viewBtn.addEventListener('click', ()=> alert('View details:\n'+(r.description||'No details')));
    contactBtn.addEventListener('click', ()=> alert('Start secure chat (placeholder)'));
    del.addEventListener('click', ()=>{ let arr=loadReports(); arr.splice(idx,1); saveReports(arr); renderFeed(searchInput && searchInput.value); });

    actions.appendChild(viewBtn); actions.appendChild(contactBtn); actions.appendChild(del);

    details.appendChild(title); details.appendChild(meta); details.appendChild(desc); details.appendChild(actions);

    card.appendChild(img); card.appendChild(details);
    feedRoot.appendChild(card);
  });
}

// Wire search
if (searchInput) {
  searchInput.addEventListener('input', (e)=> renderFeed(e.target.value));
}

// Export CSV
if (exportBtn) {
  exportBtn.addEventListener('click', ()=>{
    const rows = loadReports();
    if (!rows.length) return alert('No reports');
    const keys = ['type','name','category','color','brand','serial','place','date','contact','description'];
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='gods-eye-reports.csv'; a.click(); URL.revokeObjectURL(url);
  });
}

// Initialize sample data if empty (friendly demo data)
if (!localStorage.getItem('reports')) {
  const sample = [
    {type:'lost', name:'Black Leather Wallet', category:'Wallet', description:'Leather wallet with blue card', place:'Central Park', date:'2026-03-25', color:'black', brand:'N/A', contact:'', image:'https://images.unsplash.com/photo-1555529771-5b5d6b7b3c4b?auto=format&fit=crop&w=600&q=60'},
    {type:'found', name:'iPhone (green case)', category:'Phone', description:'Found at bus stop near Main St', place:'Main St Bus Stop', date:'2026-03-28', color:'green', brand:'Apple', contact:'', image:''}
  ];
  saveReports(sample);
}

renderFeed();