// Main buttons now open modals directly; panel/tab logic removed
const tabs = Array.from(document.querySelectorAll('.task-tab'));

document.getElementById('year').textContent = new Date().getFullYear();

// Lightweight modal system (supports multiple modals via [data-launch="<id>"])
function openModal(id) {
	const m = document.getElementById(id);
	if (!m) return;
	m.setAttribute('aria-hidden', 'false');
	m.setAttribute('aria-modal', 'true');
	m.addEventListener('click', modalDismissHandler);
}

function closeModal(m) {
	m.setAttribute('aria-hidden', 'true');
	m.setAttribute('aria-modal', 'false');
	m.removeEventListener('click', modalDismissHandler);
}

function modalDismissHandler(e) {
	const target = e.target;
	if (!(target instanceof HTMLElement)) return;
	const m = target.closest('.modal');
	if (!m) return;
	if (target.hasAttribute('data-dismiss') || target.closest('[data-dismiss]')) {
		closeModal(m);
	}
}

document.querySelectorAll('[data-launch]').forEach(el => {
	el.addEventListener('click', (e) => {
		e.preventDefault();
		const id = el.getAttribute('data-launch');
		if (id) openModal(id);
	});
});

// EMI logic: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
function computeEmi(principal, annualRatePercent, months) {
	const monthlyRate = (annualRatePercent / 100) / 12;
	if (monthlyRate === 0) return principal / months;
	const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
	const denominator = Math.pow(1 + monthlyRate, months) - 1;
	return numerator / denominator;
}

const computeBtn = document.getElementById('computeEmi');
computeBtn?.addEventListener('click', () => {
	const p = parseFloat(document.getElementById('principal').value);
	const r = parseFloat(document.getElementById('rate').value);
	const n = parseInt(document.getElementById('months').value, 10);
	const resultEl = document.getElementById('emiResult');
	if (!isFinite(p) || !isFinite(r) || !isFinite(n) || p <= 0 || r < 0 || n <= 0) {
		resultEl.textContent = 'Please enter valid positive values.';
		resultEl.style.color = '#ff8a8a';
		return;
	}
	const emi = computeEmi(p, r, n);
	resultEl.style.color = 'var(--success)';
	resultEl.textContent = `Estimated EMI: ₹${emi.toFixed(2)}`;
});

// Task 2: Fetch from a public API (Official Joke API)
const fetchBtn = document.getElementById('fetchJoke');
const jokeResult = document.getElementById('jokeResult');
const apiStatus = document.getElementById('apiStatus');

async function fetchJoke() {
	try {
		apiStatus.textContent = 'Loading…';
		jokeResult.textContent = '';
		const resp = await fetch('https://official-joke-api.appspot.com/jokes/random', { cache: 'no-store' });
		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
		const data = await resp.json();
		const setup = data.setup || 'Here is a joke:';
		const punch = data.punchline || '';
		jokeResult.innerHTML = `<strong>${setup}</strong><br/>${punch}`;
		apiStatus.textContent = 'Success';
		apiStatus.style.color = 'var(--success)';
	} catch (err) {
		apiStatus.textContent = 'Failed to fetch. Please try again.';
		apiStatus.style.color = '#ff8a8a';
		jokeResult.textContent = '';
	}
}

fetchBtn?.addEventListener('click', fetchJoke);

// Task 3: Simple Blog with Local Storage
const BLOG_KEY = 'blogPosts';
const postsList = document.getElementById('postsList');
const addPostBtn = document.getElementById('addPost');
const titleInput = document.getElementById('postTitle');
const bodyInput = document.getElementById('postBody');

function readPosts() {
	try {
		const raw = localStorage.getItem(BLOG_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function writePosts(posts) {
	localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

function renderPosts() {
	if (!postsList) return;
	const posts = readPosts();
	postsList.innerHTML = '';
	if (posts.length === 0) {
		const empty = document.createElement('div');
		empty.style.color = 'var(--muted)';
		empty.textContent = 'No posts yet. Add your first post above.';
		postsList.appendChild(empty);
		return;
	}
	for (const post of posts) {
		const card = document.createElement('div');
		card.style.padding = '12px';
		card.style.background = '#0e1330';
		card.style.border = '1px solid rgba(255,255,255,.08)';
		card.style.borderRadius = '10px';
		card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
			<strong>${escapeHtml(post.title)}</strong>
			<button data-id="${post.id}" class="del" style="background:transparent; border:1px solid rgba(255,255,255,.18); color:var(--muted); border-radius:8px; padding:6px 8px; cursor:pointer;">Delete</button>
		</div>
		<p style="margin:8px 0 0; color:#e6ebff;">${escapeHtml(post.body)}</p>`;
		postsList.appendChild(card);
	}
	postsList.querySelectorAll('.del').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.getAttribute('data-id');
			const posts = readPosts().filter(p => String(p.id) !== String(id));
			writePosts(posts);
			renderPosts();
		});
	});
}

function escapeHtml(str) {
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

addPostBtn?.addEventListener('click', () => {
	const title = titleInput.value.trim();
	const body = bodyInput.value.trim();
	if (!title || !body) return;
	const posts = readPosts();
	posts.unshift({ id: Date.now(), title, body });
	writePosts(posts);
	titleInput.value = '';
	bodyInput.value = '';
	renderPosts();
});

// Re-render posts whenever the blog modal opens
document.querySelectorAll('[data-launch="blog-demo"]').forEach(el => {
	el.addEventListener('click', () => setTimeout(renderPosts, 0));
});

// Task 4: Number Guessing Game
let secretNumber = 0;
let attempts = 0;
const feedbackEl = document.getElementById('guessFeedback');
const statsEl = document.getElementById('guessStats');
const inputEl = document.getElementById('guessInput');

function resetGame() {
	secretNumber = Math.floor(Math.random() * 100) + 1;
	attempts = 0;
	if (feedbackEl) {
		feedbackEl.style.color = 'var(--muted)';
		feedbackEl.textContent = 'Game started. Make your first guess!';
	}
	if (statsEl) statsEl.textContent = 'Attempts: 0';
	if (inputEl) inputEl.value = '';
}

function submitGuess() {
	if (!inputEl) return;
	const val = parseInt(inputEl.value, 10);
	if (!isFinite(val) || val < 1 || val > 100) {
		feedbackEl.textContent = 'Enter a number between 1 and 100.';
		feedbackEl.style.color = '#ff8a8a';
		return;
	}
	attempts += 1;
	if (val === secretNumber) {
		feedbackEl.textContent = `Correct! The number was ${secretNumber}.`;
		feedbackEl.style.color = 'var(--success)';
		statsEl.textContent = `Attempts: ${attempts}`;
		return;
	}
	feedbackEl.style.color = '#ffd24d';
	feedbackEl.textContent = val < secretNumber ? 'Too low, try a higher number.' : 'Too high, try a lower number.';
	statsEl.textContent = `Attempts: ${attempts}`;
}

document.getElementById('submitGuess')?.addEventListener('click', submitGuess);
document.getElementById('restartGame')?.addEventListener('click', resetGame);

// Reset game whenever the modal opens
document.querySelectorAll('[data-launch="guess-demo"]').forEach(el => {
	el.addEventListener('click', () => setTimeout(resetGame, 0));
});

// Task 5: Simple Contact Book
const CONTACTS_KEY = 'contactsBook';
const contactsList = document.getElementById('contactsList');
const addContactBtn = document.getElementById('addContact');
const nameInput = document.getElementById('cName');
const phoneInput = document.getElementById('cPhone');
const emailInput = document.getElementById('cEmail');
const searchInput = document.getElementById('searchContact');
const contactMsg = document.getElementById('contactMsg');

function readContacts() {
	try { return JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch { return []; }
}
function writeContacts(list) { localStorage.setItem(CONTACTS_KEY, JSON.stringify(list)); }

function renderContacts(filterTerm = '') {
	if (!contactsList) return;
	const term = filterTerm.trim().toLowerCase();
	const data = readContacts().filter(c => c.name.toLowerCase().includes(term));
	contactsList.innerHTML = '';
	if (data.length === 0) {
		const empty = document.createElement('div');
		empty.style.color = 'var(--muted)';
		empty.textContent = 'No contacts found.';
		contactsList.appendChild(empty);
		return;
	}
	for (const c of data) {
		const row = document.createElement('div');
		row.style.display = 'grid';
		row.style.gridTemplateColumns = '1fr 1fr 1fr auto';
		row.style.gap = '10px';
		row.style.alignItems = 'center';
		row.style.padding = '10px';
		row.style.background = '#0e1330';
		row.style.border = '1px solid rgba(255,255,255,.08)';
		row.style.borderRadius = '10px';
		row.innerHTML = `
			<span>${escapeHtml(c.name)}</span>
			<span style="color:#e6ebff;">${escapeHtml(c.phone)}</span>
			<span style="color:#a6e0ff;">${escapeHtml(c.email)}</span>
			<button class="del" data-id="${c.id}" style="background:transparent; border:1px solid rgba(255,255,255,.18); color:var(--muted); border-radius:8px; padding:6px 8px; cursor:pointer;">Delete</button>
		`;
		contactsList.appendChild(row);
	}
	contactsList.querySelectorAll('.del').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.getAttribute('data-id');
			const list = readContacts().filter(x => String(x.id) !== String(id));
			writeContacts(list);
			renderContacts(searchInput?.value || '');
		});
	});
}

function addContact() {
	const name = nameInput.value.trim();
	const phone = phoneInput.value.trim();
	const email = emailInput.value.trim();
	if (!name || !phone || !email) {
		if (contactMsg) { contactMsg.textContent = 'Fill name, phone, and email.'; contactMsg.style.color = '#ff8a8a'; }
		return;
	}
	const list = readContacts();
	list.unshift({ id: Date.now(), name, phone, email });
	writeContacts(list);
	nameInput.value = '';
	phoneInput.value = '';
	emailInput.value = '';
	if (contactMsg) { contactMsg.textContent = 'Contact added.'; contactMsg.style.color = 'var(--success)'; }
	renderContacts(searchInput?.value || '');
}

addContactBtn?.addEventListener('click', addContact);
searchInput?.addEventListener('input', () => renderContacts(searchInput.value));
document.querySelectorAll('[data-launch="contacts-demo"]').forEach(el => {
	el.addEventListener('click', () => setTimeout(() => renderContacts(''), 0));
});

