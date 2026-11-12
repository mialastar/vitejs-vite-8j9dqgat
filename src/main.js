import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lrkiivqbnkkduxfcrbjn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2lpdnFibmtrZHV4ZmNyYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTI0MTMsImV4cCI6MjExMDA4ODQxM30.jpDPREZttmd__dVy2Uy3DdmjRUPQtdd_nUoJWAyOO6Y"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GESTION DES ÉCRANS ---
const screenIntro = document.getElementById('screen-intro');
const screenCredits = document.getElementById('screen-credits');
const screenAuth = document.getElementById('screen-auth');
const screenApp = document.getElementById('screen-app');
const btnStart = document.getElementById('btn-start');
const btnContinueCredits = document.getElementById('btn-continue-credits');
const btnDiscordLogin = document.getElementById('btn-discord-login');

function switchScreen(current, next) {
  if(!current || !next) return;
  current.classList.remove('active');
  setTimeout(() => next.classList.add('active'), 800); 
}

btnStart.addEventListener('click', () => switchScreen(screenIntro, screenCredits));
btnContinueCredits.addEventListener('click', () => switchScreen(screenCredits, screenAuth));

// --- CONNEXION ---
btnDiscordLogin.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: 'https://lgdc-rp.vercel.app' }
  });
  if (error) alert("Erreur de connexion.");
});

async function checkUser() {
  const { data } = await supabase.auth.getSession();
  if (data && data.session) {
    screenIntro.classList.remove('active');
    screenCredits.classList.remove('active');
    screenAuth.classList.remove('active');
    screenApp.classList.add('active');
  }
}
checkUser();

// --- NAVIGATION ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    views.forEach(v => v.classList.remove('active'));
    const target = e.currentTarget.getAttribute('data-target');
    if(target === 'accueil') document.getElementById('view-accueil').classList.add('active');
    if(target === 'fiches') document.getElementById('view-fiches').classList.add('active');
  });
});

const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const subviews = document.querySelectorAll('.subview');
subTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    subTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    subviews.forEach(v => v.classList.remove('active'));
    document.getElementById(`subview-${e.currentTarget.getAttribute('data-sub')}`).classList.add('active');
  });
});

// --- WIZARD ---
let currentStep = 1;
const totalSteps = 9;
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressFill = document.getElementById('progress-bar-fill');
const stepNumText = document.getElementById('current-step-num');

function updateWizard() {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${currentStep}`).classList.add('active');
  stepNumText.textContent = currentStep;
  progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  if (currentStep === totalSteps) {
    btnNext.textContent = 'Soumettre la fiche';
    btnNext.style.background = '#10b981';
  } else {
    btnNext.textContent = 'Suivant';
    btnNext.style.background = '';
  }
}

btnPrev.addEventListener('click', () => { if (currentStep > 1) { currentStep--; updateWizard(); } });

btnNext.addEventListener('click', async () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizard();
  } else {
    // RÉCUPÉRATION DES DONNÉES
    const nom = document.querySelector('#step-1 input').value;
    const clan = document.querySelector('#step-1 select').value; 
    const rang = document.querySelectorAll('#step-1 select')[1].value; 
    const pelage = document.querySelectorAll('#step-2 input')[0].value;
    const yeux = document.querySelectorAll('#step-2 input')[1].value;
    const traits = document.querySelectorAll('#step-3 input')[0].value;
    const qualites = document.querySelectorAll('#step-3 input')[1].value;
    const defauts = document.querySelectorAll('#step-3 input')[2].value;
    const origines = document.querySelectorAll('#step-4 textarea')[0].value;
    const evenements = document.querySelectorAll('#step-4 textarea')[1].value;
    
    // Récupérer les cases cochées
    const checkedBoxes = document.querySelectorAll('.comp-checkbox:checked');
    const competences_list = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

    const competences_details = document.querySelector('#step-5 textarea').value;
    const obj_court = document.querySelectorAll('#step-6 input')[0].value;
    const obj_long = document.querySelectorAll('#step-6 input')[1].value;
    const reves = document.querySelector('#step-6 textarea').value;
    const peurs = document.querySelector('#step-7 input').value;
    const vulnerabilites = document.querySelector('#step-7 textarea').value;

    const stats_force = document.getElementById('stat-force').value;
    const stats_agilite = document.getElementById('stat-agilite').value;
    const stats_endurance = document.getElementById('stat-endurance').value;
    const stats_ruse = document.getElementById('stat-ruse').value;
    const stats_charisme = document.getElementById('stat-charisme').value;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('fiches_oc').insert({
      user_id: user.id, nom, clan, rang, pelage, yeux, traits, qualites, defauts, origines, evenements, 
      competences_list, competences_details, 
      objectifs_court: obj_court, objectifs_long: obj_long, reves, peurs, vulnerabilites,
      stats_force: parseInt(stats_force), stats_agilite: parseInt(stats_agilite), 
      stats_endurance: parseInt(stats_endurance), stats_ruse: parseInt(stats_ruse), stats_charisme: parseInt(stats_charisme),
      statut: 'En attente'
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      const toast = document.getElementById('toast-success');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('show'), 50);
      setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);

      document.querySelectorAll('.wizard-form input, .wizard-form textarea').forEach(el => el.value = '');
      document.querySelectorAll('.wizard-form select').forEach(el => el.selectedIndex = 0);
      document.querySelectorAll('.comp-checkbox').forEach(cb => cb.checked = false);
      
      currentStep = 1;
      updateWizard();
      document.querySelector('[data-sub="mine"]').click();
      loadMyFiches();
    }
  }
});

// --- STATS LOGIC ---
const sliders = document.querySelectorAll('.stat-slider');
const pointsLeftDisplay = document.getElementById('points-left');
const maxPoints = 20;

function updateStats() {
  let totalUsed = 0;
  sliders.forEach(s => {
    totalUsed += parseInt(s.value);
    document.getElementById(`val-${s.id.split('-')[1]}`).textContent = s.value;
  });
  pointsLeftDisplay.textContent = maxPoints - totalUsed;
  pointsLeftDisplay.style.color = (maxPoints - totalUsed) < 0 ? '#ef4444' : 'var(--accent)';
}

sliders.forEach(s => {
  s.addEventListener('input', () => {
    let total = 0; sliders.forEach(sl => total += parseInt(sl.value));
    if (total > maxPoints) s.value = parseInt(s.value) - 1;
    updateStats();
  });
});
updateStats();

// --- AFFICHAGE (MES FICHES ET TOUTES LES FICHES) ---
async function loadMyFiches() {
  const container = document.getElementById('my-fiches-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';
  const { data: { user } } = await supabase.auth.getUser();
  const { data: fiches, error } = await supabase.from('fiches_oc').select('*').eq('user_id', user.id).order('date_creation', { ascending: false });

  if (error || fiches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray;">Tu n\'as pas encore de fiche.</p>';
    return;
  }
  container.innerHTML = '';
  fiches.forEach(fiche => {
    let statusClass = fiche.statut === 'Validée' ? 'status-valide' : (fiche.statut === 'Refusée' ? 'status-refuse' : 'status-attente');
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.innerHTML = `
      <div class="fiche-card-header"><h4>${fiche.nom}</h4><span class="status-badge ${statusClass}">${fiche.statut}</span></div>
      <div class="fiche-card-info"><p><strong>Clan :</strong> ${fiche.clan}</p><p><strong>Rang :</strong> ${fiche.rang}</p></div>
      <div class="fiche-card-actions"><button class="btn-action btn-modifier" onclick="alert('Bientôt disponible !')">Modifier</button><button class="btn-action btn-supprimer" onclick="alert('Bientôt disponible !')">Supprimer</button></div>
    `;
    container.appendChild(card);
  });
}
document.querySelector('[data-sub="mine"]').addEventListener('click', loadMyFiches);

let allValidatedFiches = [];
async function loadAllFiches() {
  const container = document.getElementById('all-fiches-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';
  const { data: fiches, error } = await supabase.from('fiches_oc').select('*').eq('statut', 'Validée').order('date_creation', { ascending: false });
  if (error || fiches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray;">Aucune fiche validée pour le moment.</p>';
    return;
  }
  allValidatedFiches = fiches;
  renderPublicFiches(fiches);
}

function renderPublicFiches(fiches) {
  const container = document.getElementById('all-fiches-container');
  container.innerHTML = '';
  fiches.forEach(fiche => {
    let imageHtml = (fiche.image_url && fiche.image_url.trim() !== '') ? `<div class="card-image" style="background-image: url('${fiche.image_url}')"></div>` : '';
    const card = document.createElement('div');
    card.className = 'public-fiche-card';
    card.innerHTML = `
      ${imageHtml}
      <div class="card-content">
        <h3>${fiche.nom}</h3>
        <div class="card-tags"><span class="tag">${fiche.clan}</span><span class="tag">${fiche.rang}</span></div>
        <p class="card-bio">${fiche.origines ? fiche.origines.substring(0, 100) + '...' : 'Pas d\'histoire.'}</p>
      </div>
    `;
    card.addEventListener('click', () => openFicheDetail(fiche));
    container.appendChild(card);
  });
}
document.getElementById('search-fiches').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  renderPublicFiches(allValidatedFiches.filter(f => f.nom.toLowerCase().includes(term)));
});
document.querySelector('[data-sub="all"]').addEventListener('click', loadAllFiches);


// --- PAGE DE DÉTAIL (REMPLIE TOUT) ---
function openFicheDetail(fiche) {
  document.getElementById('view-fiches').classList.remove('active');
  document.getElementById('view-fiche-detail').classList.add('active');
  window.scrollTo(0, 0);

  // Infos de base
  document.getElementById('detail-nom').textContent = fiche.nom;
  document.getElementById('detail-clan').textContent = fiche.clan;
  document.getElementById('detail-rang').textContent = fiche.rang;

  // Onglet Histoire
  document.getElementById('detail-pelage').textContent = fiche.pelage || 'Non renseigné';
  document.getElementById('detail-yeux').textContent = fiche.yeux || 'Non renseigné';
  document.getElementById('detail-origines').textContent = fiche.origines || 'Non renseigné.';
  document.getElementById('detail-evenements').textContent = fiche.evenements || 'Non renseigné.';

  // Onglet Caractère
  document.getElementById('detail-traits').textContent = fiche.traits || 'Non renseigné';
  document.getElementById('detail-qualites').textContent = fiche.qualites || 'Non renseigné';
  document.getElementById('detail-defauts').textContent = fiche.defauts || 'Non renseigné';
  document.getElementById('detail-obj-court').textContent = fiche.objectifs_court || 'Non renseigné';
  document.getElementById('detail-obj-long').textContent = fiche.objectifs_long || 'Non renseigné';
  document.getElementById('detail-reves').textContent = fiche.reves || 'Non renseigné';
  document.getElementById('detail-peurs').textContent = fiche.peurs || 'Non renseigné';
  document.getElementById('detail-vulnerabilites').textContent = fiche.vulnerabilites || 'Non renseigné';

  // Onglet Compétences & Stats
  const compContainer = document.getElementById('detail-competences-list');
  compContainer.innerHTML = '';
  if (fiche.competences_list) {
    fiche.competences_list.split(',').forEach(comp => {
      if(comp.trim()) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.style.background = 'rgba(251, 191, 36, 0.2)';
        tag.style.color = 'var(--accent)';
        tag.textContent = comp.trim();
        compContainer.appendChild(tag);
      }
    });
  } else {
    compContainer.innerHTML = '<span style="color: gray;">Aucune spécialité cochée.</span>';
  }
  document.getElementById('detail-competences-details').textContent = fiche.competences_details || 'Aucun détail fourni.';

  // Image
  const imgContainer = document.getElementById('detail-image');
  if (fiche.image_url && fiche.image_url.trim() !== '') {
    imgContainer.style.backgroundImage = `url('${fiche.image_url}')`;
    imgContainer.style.display = 'block';
  } else {
    imgContainer.style.display = 'none';
  }

  // Stats
  const stats = [
    { id: 'force', val: fiche.stats_force }, { id: 'agilite', val: fiche.stats_agilite },
    { id: 'endurance', val: fiche.stats_endurance }, { id: 'ruse', val: fiche.stats_ruse },
    { id: 'charisme', val: fiche.stats_charisme }
  ];
  stats.forEach(stat => {
    const val = stat.val || 0;
    document.getElementById(`num-${stat.id}`).textContent = val;
    document.getElementById(`bar-${stat.id}`).style.width = `${(val / 10) * 100}%`;
  });

  // Réinitialiser sur l'onglet Histoire par défaut
  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.detail-tab-btn[data-dtab="histoire"]').classList.add('active');
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  document.getElementById('dtab-histoire').classList.add('active');
}

// --- ONGLETS INTERNES DETAIL ---
const detailTabBtns = document.querySelectorAll('.detail-tab-btn');
const dtabs = document.querySelectorAll('.dtab');
detailTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    detailTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    dtabs.forEach(t => t.classList.remove('active'));
    document.getElementById(`dtab-${e.currentTarget.getAttribute('data-dtab')}`).classList.add('active');
  });
});

document.getElementById('btn-back-fiches').addEventListener('click', () => {
  document.getElementById('view-fiche-detail').classList.remove('active');
  document.getElementById('view-fiches').classList.add('active');
  document.querySelector('[data-sub="all"]').classList.add('active');
  document.getElementById('subview-all').classList.add('active');
});