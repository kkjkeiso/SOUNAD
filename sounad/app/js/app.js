/* ===== SounAD — app.js v2 ===== */

/* ───────────────────────────────────────────
   DECORATIVE RIBBONS (dashboard / search)
─────────────────────────────────────────── */
function ribbonSVG(seed = 0) {
  const id   = 'g' + Math.random().toString(36).slice(2, 8);
  const rot  = (seed * 37) % 28 - 10;
  const flip = seed % 2 === 0 ? 1 : -1;
  return `<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg"
    style="transform:rotate(${rot}deg) scaleX(${flip})">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#1d6bfc" stop-opacity="0"/>
        <stop offset="40%"  stop-color="#1d6bfc"/>
        <stop offset="65%"  stop-color="#a259ff"/>
        <stop offset="100%" stop-color="#a259ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M -20 220 C 150 260, 280 60, 460 120 S 640 40, 680 -10"
      fill="none" stroke="url(#${id})" stroke-width="3.5"
      stroke-linecap="round" opacity=".5"/>
    <path class="flow-line"
      d="M -20 235 C 150 275, 280 75, 460 135 S 640 55, 680 5"
      fill="none" stroke="url(#${id})" stroke-width="2"
      stroke-linecap="round"/>
  </svg>`;
}

function paintDecor() {
  document.querySelectorAll('[data-ribbon]').forEach((el, i) => {
    el.innerHTML = ribbonSVG(i + 1);
  });
}

/* ───────────────────────────────────────────
   PARALLAX (landing waves)
─────────────────────────────────────────── */
function initParallax(root) {
  if (!root) return;
  const targets = root.querySelectorAll('[data-parallax]');
  if (!targets.length) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  root.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth  - .5;
    my = e.clientY / window.innerHeight - .5;
  });
  function tick() {
    cx += (mx - cx) * 0.035;
    cy += (my - cy) * 0.035;
    targets.forEach(el => {
      const s = parseFloat(el.dataset.parallax) || 12;
      el.style.setProperty('--px', `${cx * s}px`);
      el.style.setProperty('--py', `${cy * s * .65}px`);
    });
    requestAnimationFrame(tick);
  }
  tick();
}

/* ───────────────────────────────────────────
   PLAYLISTS — localStorage
─────────────────────────────────────────── */
const STORE_KEY = 'sounad_playlists_v2';

function getPlaylists() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function savePlaylists(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}
function createPlaylist(name) {
  const list = getPlaylists();
  const pl = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,5), name, tracks: [], createdAt: Date.now() };
  list.push(pl);
  savePlaylists(list);
  return pl;
}
function deletePlaylist(id) {
  savePlaylists(getPlaylists().filter(p => p.id !== id));
}
function addTrackToPlaylist(id, track) {
  const list = getPlaylists();
  const pl = list.find(p => p.id === id);
  if (!pl) return;
  // Avoid duplicates by title+artist
  const isDupe = pl.tracks.some(t =>
    t.title.toLowerCase() === track.title.toLowerCase() &&
    t.artist.toLowerCase() === track.artist.toLowerCase()
  );
  if (isDupe) { showToast(`"${track.title}" já está nesta playlist`, 'error'); return; }
  pl.tracks.push({ ...track, addedAt: Date.now() });
  savePlaylists(list);
}
function removeTrack(id, idx) {
  const list = getPlaylists();
  const pl = list.find(p => p.id === id);
  if (!pl) return;
  pl.tracks.splice(idx, 1);
  savePlaylists(list);
}

/* ───────────────────────────────────────────
   TOAST NOTIFICATIONS
─────────────────────────────────────────── */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✓', error: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  toast.addEventListener('click', () => removeToast(toast));
  setTimeout(() => removeToast(toast), 3200);
}

function removeToast(toast) {
  toast.classList.add('toast-fade-out');
  setTimeout(() => toast.remove(), 320);
}

/* ───────────────────────────────────────────
   AI CURATOR — Groq API
   Chave fica APENAS no localStorage do usuário.
─────────────────────────────────────────── */
const GROQ_KEY_STORE = 'sounad_groq_key';
function getGroqKey()  { return localStorage.getItem(GROQ_KEY_STORE) || ''; }
function setGroqKey(k) { localStorage.setItem(GROQ_KEY_STORE, k); }

async function aiSearchTracks(query) {
  const key = getGroqKey();
  if (!key) throw new Error(
    'Configure sua chave de IA no ícone de engrenagem ⚙ antes de buscar. É gratuita em console.groq.com.'
  );

  const systemPrompt = `Você é um curador musical especialista. 
Dado um pedido do usuário, sugira 8 músicas reais que existem, variadas e que combinem perfeitamente com o pedido.
REGRAS ABSOLUTAS:
- Responda APENAS com um array JSON válido, sem texto extra antes ou depois
- Cada item deve ter exatamente: {"title":"...","artist":"...","reason":"motivo curto e específico em português"}
- "reason" deve ser conciso, máximo 80 caracteres, explicando por que a música combina
- Inclua artistas conhecidos E independentes
- Varie os gêneros quando fizer sentido para o pedido
- Não inclua músicas fictícias`;

  const userPrompt = `Pedido: "${query}"`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.75,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('Chave de IA inválida ou expirada. Verifique nas configurações ⚙.');
    if (res.status === 429) throw new Error('Limite de requisições da IA atingido. Aguarde um momento.');
    throw new Error(`Erro da IA (${res.status}): ${t.slice(0, 100)}`);
  }

  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content || '[]';
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const tracks = JSON.parse(cleaned);
    if (!Array.isArray(tracks)) throw new Error('Resposta inválida da IA');
    return tracks.filter(t => t.title && t.artist);
  } catch {
    throw new Error('A IA retornou um formato inesperado. Tente novamente.');
  }
}

/* ───────────────────────────────────────────
   SPOTIFY WEB API
   Client Credentials flow — client ID + Secret
   ficam apenas no localStorage do usuário.
   NOTA: Em produção, o token deve ser gerado
   por um backend para não expor o secret.
─────────────────────────────────────────── */
const SPOTIFY_ID_STORE     = 'sounad_spotify_id';
const SPOTIFY_SECRET_STORE = 'sounad_spotify_secret';

function getSpotifyCreds() {
  return {
    id:     localStorage.getItem(SPOTIFY_ID_STORE)     || '',
    secret: localStorage.getItem(SPOTIFY_SECRET_STORE) || ''
  };
}
function setSpotifyCreds(id, secret) {
  localStorage.setItem(SPOTIFY_ID_STORE,     id);
  localStorage.setItem(SPOTIFY_SECRET_STORE, secret);
}

let _spotifyToken    = null;
let _spotifyTokenExp = 0;

async function getSpotifyToken() {
  const { id, secret } = getSpotifyCreds();
  if (!id || !secret) throw new Error(
    'Preencha o Client ID e o Client Secret do Spotify nas configurações ⚙.\n' +
    'Crie um app gratuito em developer.spotify.com/dashboard.'
  );
  if (_spotifyToken && Date.now() < _spotifyTokenExp) return _spotifyToken;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${id}:${secret}`)
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    if (res.status === 400) throw new Error('Client ID ou Client Secret inválido. Verifique nas configurações ⚙.');
    throw new Error(`Erro ao autenticar no Spotify (${res.status}). Verifique suas credenciais.`);
  }

  const data = await res.json();
  _spotifyToken    = data.access_token;
  _spotifyTokenExp = Date.now() + (data.expires_in - 30) * 1000;
  return _spotifyToken;
}

async function spotifySearchTracks(query) {
  const token = await getSpotifyToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Erro na busca do Spotify (${res.status}). Tente novamente.`);
  const data = await res.json();
  return (data.tracks?.items || []).map(t => ({
    title:      t.name,
    artist:     t.artists.map(a => a.name).join(', '),
    album:      t.album?.name || '',
    image:      t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
    previewUrl: t.preview_url,
    spotifyUrl: t.external_urls?.spotify || '',
    duration:   t.duration_ms ? msToMin(t.duration_ms) : ''
  }));
}

function msToMin(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ───────────────────────────────────────────
   INIT
─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', paintDecor);
