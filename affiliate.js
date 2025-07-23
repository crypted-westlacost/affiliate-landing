// Config
const MICROLINK_API = 'https://api.microlink.io/?url=';

// You can edit on GitHub: only owner (westlacost) can push changes
// All links will be stored in localStorage for simplicity

const AFFILIATE_KEY = 'westlacost-affiliates';
const BLOCKS_PER_ROW = 5;

// Main Elements
const form = document.getElementById('affiliate-form');
const input = document.getElementById('affiliate-link');
const list = document.getElementById('affiliate-list');
const addMoreBtn = document.getElementById('add-more-btn');

// Cookie Banner
const cookieBanner = document.getElementById('cookie-banner');
const acceptCookies = document.getElementById('accept-cookies');

// State
let affiliates = [];
let displayed = 0;

// Helpers
function saveAffiliates() {
  localStorage.setItem(AFFILIATE_KEY, JSON.stringify(affiliates));
}
function loadAffiliates() {
  const data = localStorage.getItem(AFFILIATE_KEY);
  if (data) affiliates = JSON.parse(data);
}
function createBlock({ url, title, description, image }) {
  const block = document.createElement('div');
  block.className = 'affiliate-block';

  const img = document.createElement('img');
  img.src = image || 'https://microlink.io/logo.svg';
  img.alt = title || 'imagem do produto';

  const t = document.createElement('div');
  t.className = 'affiliate-title';
  t.textContent = title || 'sem título';

  const desc = document.createElement('div');
  desc.className = 'affiliate-desc';
  desc.textContent = description || '';

  const btn = document.createElement('button');
  btn.className = 'affiliate-go';
  btn.textContent = 'go';
  btn.onclick = () => window.open(url, '_blank', 'noopener');

  block.appendChild(img);
  block.appendChild(t);
  block.appendChild(desc);
  block.appendChild(btn);

  return block;
}

// Render: 5 per row, add more
function renderList() {
  list.innerHTML = '';
  const toShow = affiliates.slice(0, displayed);
  toShow.forEach(data => {
    list.appendChild(createBlock(data));
  });
  // Add "add more" button if more remain
  if (displayed < affiliates.length) {
    addMoreBtn.style.display = 'block';
  } else {
    addMoreBtn.style.display = 'none';
  }
}

// On form submit: get microlink, push to array, save, re-render
form.onsubmit = async e => {
  e.preventDefault();
  const url = input.value.trim();
  if (!url) return;
  input.value = '';
  form.querySelector('button').disabled = true;
  try {
    const r = await fetch(MICROLINK_API + encodeURIComponent(url));
    const { data, status } = await r.json();
    if (status === 'success') {
      const item = {
        url,
        title: (data.title || '').toLowerCase(),
        description: (data.description || '').toLowerCase(),
        image: data.image?.url || data.logo?.url || ''
      };
      affiliates.unshift(item); // newest first
      saveAffiliates();
      displayed = Math.min(affiliates.length, BLOCKS_PER_ROW);
      renderList();
    } else {
      alert('não foi possível puxar dados do link.');
    }
  } catch (err) {
    alert('erro ao puxar dados do link.');
  }
  form.querySelector('button').disabled = false;
};

// Add more button
addMoreBtn.onclick = function () {
  displayed = Math.min(displayed + BLOCKS_PER_ROW, affiliates.length);
  renderList();
};

// Cookie Banner logic
if (!localStorage.getItem('westlacost-cookies-ok')) {
  cookieBanner.style.display = 'block';
  acceptCookies.onclick = function () {
    localStorage.setItem('westlacost-cookies-ok', '1');
    cookieBanner.style.display = 'none';
  };
} else {
  cookieBanner.style.display = 'none';
}

// Load on start
(function () {
  loadAffiliates();
  displayed = Math.min(affiliates.length, BLOCKS_PER_ROW);
  renderList();
})();

// Only you can edit: Add a security comment
console.log('Para editar, faça push no GitHub pelo usuário autorizado.');
