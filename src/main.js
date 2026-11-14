import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lrkiivqbnkkduxfcrbjn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2lpdnFibmtrZHV4ZmNyYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTI0MTMsImV4cCI6MjExMDA4ODQxM30.jpDPREZttmd__dVy2Uy3DdmjRUPQtdd_nUoJWAyOO6Y"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let editingFicheId = null; 
let currentEditingImage = ""; 
let currentTicketType = "";
let currentRelationFicheId = null;

// ==========================================
// --- GESTION DES ÉCRANS ---
// ==========================================
const screenIntro = document.getElementById('screen-intro');
const screenCredits = document.getElementById('screen-credits');
const screenAuth = document.getElementById('screen-auth');
const screenApp = document.getElementById('screen-app');
const screenAdmin = document.getElementById('screen-admin');

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

// ==========================================
// --- NAVIGATION JOUEUR ---
// ==========================================
const navBtns = document.querySelectorAll('.bottom-nav:not(.admin-nav) .nav-btn');
const views = document.querySelectorAll('.app-content:not(.admin-layout .app-content) .view');

navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    views.forEach(v => v.classList.remove('active'));
    
    const target = e.currentTarget.getAttribute('data-target');
    
    if(target === 'accueil') document.getElementById('view-accueil').classList.add('active');
    if(target === 'fiches') document.getElementById('view-fiches').classList.add('active');
    if(target === 'monde') document.getElementById('view-monde').classList.add('active');
    if(target === 'chroniques') document.getElementById('view-chroniques').classList.add('active');
    if(target === 'profil') {
      document.getElementById('view-profil').classList.add('active');
      loadProfil(); 
    }
  });
});

// Onglets Monde
document.querySelectorAll('.monde-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.monde-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.monde-content').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById(`monde-${e.currentTarget.getAttribute('data-monde')}`).classList.add('active');
  });
});

document.querySelectorAll('.lore-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.lore-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.lore-content').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById(`lore-${e.currentTarget.getAttribute('data-lore')}`).classList.add('active');
  });
});

// Onglets Fiches (4 onglets)
document.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.subview').forEach(v => v.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    const target = e.currentTarget.getAttribute('data-sub');
    document.getElementById(`subview-${target}`).classList.add('active');
    
    if (target === 'mine') loadMyFiches();
    if (target === 'all') loadAllFiches();
    if (target === 'relations') loadMyRelations();
  });
});

// ==========================================
// --- WIZARD FICHES OC ---
// ==========================================
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
    btnNext.textContent = editingFicheId ? 'Mettre à jour' : 'Soumettre';
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

    let imageUrl = currentEditingImage; 
    const fileInput = document.getElementById('image-upload');
    
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage.from('fiches-images').upload(fileName, file);
      if (uploadError) { alert("Erreur upload : " + uploadError.message); return; }

      const { data: urlData } = supabase.storage.from('fiches-images').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const ficheData = {
      nom, clan, rang, pelage, yeux, traits, qualites, defauts, origines, evenements, 
      competences_list, competences_details, 
      objectifs_court: obj_court, objectifs_long: obj_long, reves, peurs, vulnerabilites,
      image_url: imageUrl,
      stats_force: parseInt(stats_force), stats_agilite: parseInt(stats_agilite), 
      stats_endurance: parseInt(stats_endurance), stats_ruse: parseInt(stats_ruse), stats_charisme: parseInt(stats_charisme),
      statut: 'En attente' 
    };

    let error;
    if (editingFicheId) {
      const { error: updateError } = await supabase.from('fiches_oc').update(ficheData).eq('id', editingFicheId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('fiches_oc').insert({ ...ficheData, user_id: user.id });
      error = insertError;
    }

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
      document.getElementById('image-preview').style.display = 'none';
      
      editingFicheId = null; 
      currentEditingImage = "";
      currentStep = 1;
      updateWizard();
      
      document.querySelector('[data-sub="mine"]').click();
    }
  }
});

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

document.getElementById('image-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const preview = document.getElementById('image-preview');
      preview.src = event.target.result;
      preview.style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
});

// ==========================================
// --- FICHES : MES FICHES, VOIR, DETAILS ---
// ==========================================
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
      <div class="fiche-card-actions">
        <button class="btn-action btn-modifier" onclick="editFiche('${fiche.id}')">Modifier</button>
        <button class="btn-action btn-supprimer" onclick="deleteFiche('${fiche.id}')">Supprimer</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.editFiche = async function(id) {
  const confirmModif = confirm("⚠️ Si tu modifies ta fiche, elle repassera en 'En attente'. Continuer ?");
  if (!confirmModif) return;
  const { data: fiche, error } = await supabase.from('fiches_oc').select('*').eq('id', id).single();
  if (error || !fiche) return alert("Erreur.");
  editingFicheId = id;
  currentEditingImage = fiche.image_url || "";
  
  document.querySelector('#step-1 input').value = fiche.nom || '';
  document.querySelectorAll('#step-1 select')[0].value = fiche.clan || 'Clan de la Forêt';
  document.querySelectorAll('#step-1 select')[1].value = fiche.rang || 'Guerrier';
  document.querySelectorAll('#step-2 input')[0].value = fiche.pelage || '';
  document.querySelectorAll('#step-2 input')[1].value = fiche.yeux || '';
  document.querySelectorAll('#step-3 input')[0].value = fiche.traits || '';
  document.querySelectorAll('#step-3 input')[1].value = fiche.qualites || '';
  document.querySelectorAll('#step-3 input')[2].value = fiche.defauts || '';
  document.querySelectorAll('#step-4 textarea')[0].value = fiche.origines || '';
  document.querySelectorAll('#step-4 textarea')[1].value = fiche.evenements || '';
  
  document.querySelectorAll('.comp-checkbox').forEach(cb => {
    cb.checked = fiche.competences_list ? fiche.competences_list.includes(cb.value) : false;
  });
  document.querySelector('#step-5 textarea').value = fiche.competences_details || '';
  document.querySelectorAll('#step-6 input')[0].value = fiche.objectifs_court || '';
  document.querySelectorAll('#step-6 input')[1].value = fiche.objectifs_long || '';
  document.querySelector('#step-6 textarea').value = fiche.reves || '';
  document.querySelector('#step-7 input').value = fiche.peurs || '';
  document.querySelector('#step-7 textarea').value = fiche.vulnerabilites || '';
  
  const preview = document.getElementById('image-preview');
  if (fiche.image_url) { preview.src = fiche.image_url; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
  
  document.getElementById('stat-force').value = fiche.stats_force || 1;
  document.getElementById('stat-agilite').value = fiche.stats_agilite || 1;
  document.getElementById('stat-endurance').value = fiche.stats_endurance || 1;
  document.getElementById('stat-ruse').value = fiche.stats_ruse || 1;
  document.getElementById('stat-charisme').value = fiche.stats_charisme || 1;
  updateStats();

  document.querySelector('[data-sub="create"]').click();
  currentStep = 1;
  updateWizard();
};

window.deleteFiche = async function(id) {
  if(confirm("Supprimer cette fiche ?")) {
    const { error } = await supabase.from('fiches_oc').delete().eq('id', id);
    if (error) alert("Erreur."); else loadMyFiches();
  }
};

let allValidatedFiches = [];
async function loadAllFiches() {
  const container = document.getElementById('all-fiches-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';
  const { data: fiches, error } = await supabase.from('fiches_oc').select('*').eq('statut', 'Validée').order('date_creation', { ascending: false });
  
  if (error || fiches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray;">Aucune fiche validée.</p>';
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
    card.innerHTML = `${imageHtml}<div class="card-content"><h3>${fiche.nom}</h3><div class="card-tags"><span class="tag">${fiche.clan}</span><span class="tag">${fiche.rang}</span></div><p class="card-bio">${fiche.origines ? fiche.origines.substring(0, 100) + '...' : 'Pas d\'histoire.'}</p></div>`;
    card.addEventListener('click', () => openFicheDetail(fiche));
    container.appendChild(card);
  });
}

document.getElementById('search-fiches').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  renderPublicFiches(allValidatedFiches.filter(f => f.nom.toLowerCase().includes(term)));
});

function openFicheDetail(fiche) {
  currentRelationFicheId = fiche.id;
  document.getElementById('view-fiches').classList.remove('active');
  document.getElementById('view-fiche-detail').classList.add('active');
  window.scrollTo(0, 0);

  document.getElementById('detail-nom').textContent = fiche.nom;
  document.getElementById('detail-clan').textContent = fiche.clan;
  document.getElementById('detail-rang').textContent = fiche.rang;

  document.getElementById('detail-pelage').textContent = fiche.pelage || 'Non renseigné';
  document.getElementById('detail-yeux').textContent = fiche.yeux || 'Non renseigné';
  document.getElementById('detail-origines').textContent = fiche.origines || 'Non renseigné.';
  document.getElementById('detail-evenements').textContent = fiche.evenements || 'Non renseigné.';

  document.getElementById('detail-traits').textContent = fiche.traits || 'Non renseigné';
  document.getElementById('detail-qualites').textContent = fiche.qualites || 'Non renseigné';
  document.getElementById('detail-defauts').textContent = fiche.defauts || 'Non renseigné';
  document.getElementById('detail-obj-court').textContent = fiche.objectifs_court || 'Non renseigné';
  document.getElementById('detail-obj-long').textContent = fiche.objectifs_long || 'Non renseigné';
  document.getElementById('detail-reves').textContent = fiche.reves || 'Non renseigné';
  document.getElementById('detail-peurs').textContent = fiche.peurs || 'Non renseigné';
  document.getElementById('detail-vulnerabilites').textContent = fiche.vulnerabilites || 'Non renseigné';

  const compContainer = document.getElementById('detail-competences-list');
  compContainer.innerHTML = '';
  if (fiche.competences_list) {
    fiche.competences_list.split(',').forEach(comp => {
      if(comp.trim()) { compContainer.innerHTML += `<span class="tag" style="background: rgba(251, 191, 36, 0.2); color: var(--accent);">${comp.trim()}</span>`; }
    });
  }
  document.getElementById('detail-competences-details').textContent = fiche.competences_details || 'Aucun détail.';

  const imgContainer = document.getElementById('detail-image');
  if (fiche.image_url && fiche.image_url.trim() !== '') {
    imgContainer.style.backgroundImage = `url('${fiche.image_url}')`;
    imgContainer.style.display = 'block';
  } else { imgContainer.style.display = 'none'; }

  const stats = [{ id: 'force', val: fiche.stats_force }, { id: 'agilite', val: fiche.stats_agilite }, { id: 'endurance', val: fiche.stats_endurance }, { id: 'ruse', val: fiche.stats_ruse }, { id: 'charisme', val: fiche.stats_charisme }];
  stats.forEach(stat => {
    const val = stat.val || 0;
    document.getElementById(`num-${stat.id}`).textContent = val;
    document.getElementById(`bar-${stat.id}`).style.width = `${(val / 10) * 100}%`;
  });

  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.detail-tab-btn[data-dtab="histoire"]').classList.add('active');
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  document.getElementById('dtab-histoire').classList.add('active');
}

document.querySelectorAll('.detail-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById(`dtab-${e.currentTarget.getAttribute('data-dtab')}`).classList.add('active');
  });
});

document.getElementById('btn-back-fiches').addEventListener('click', () => {
  document.getElementById('view-fiche-detail').classList.remove('active');
  document.getElementById('view-fiches').classList.add('active');
  document.querySelector('[data-sub="all"]').classList.add('active');
  document.getElementById('subview-all').classList.add('active');
});

// ==========================================
// --- RELATIONS (NOUVEL ONGLET) ---
// ==========================================
async function loadMyRelations() {
  const container = document.getElementById('my-relations-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tickets, error } = await supabase.from('tickets').select('*').eq('user_id', user.id).eq('type_ticket', 'relation').order('date_creation', { ascending: false });

  if (error || tickets.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray; margin-top: 20px;">Aucune demande pour le moment.</p>';
    return;
  }
  container.innerHTML = '';
  tickets.forEach(ticket => {
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.innerHTML = `<div class="fiche-card-header"><h4>${ticket.sujet}</h4><span class="status-badge status-attente">En attente</span></div><p style="font-size: 0.9rem; color: #cbd5e1;">${ticket.description.split('\n')[0]}</p>`;
    container.appendChild(card);
  });
}

document.getElementById('btn-new-relation').addEventListener('click', async () => {
  document.getElementById('relation-modal').classList.add('active');
  document.getElementById('rel-message').value = '';
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: mesFiches } = await supabase.from('fiches_oc').select('id, nom').eq('user_id', user.id).eq('statut', 'Validée');
  const selectSource = document.getElementById('rel-source');
  selectSource.innerHTML = '<option value="">Choisir ton personnage...</option>';
  if (mesFiches && mesFiches.length > 0) mesFiches.forEach(f => selectSource.innerHTML += `<option value="${f.id}">${f.nom}</option>`);
  else selectSource.innerHTML = '<option value="">Aucune fiche validée</option>';

  const { data: autresFiches } = await supabase.from('fiches_oc').select('id, nom').eq('statut', 'Validée');
  const selectCible = document.getElementById('rel-cible');
  selectCible.innerHTML = '<option value="">Choisir le personnage ciblé...</option>';
  if (autresFiches && autresFiches.length > 0) autresFiches.forEach(f => selectCible.innerHTML += `<option value="${f.id}">${f.nom}</option>`);
});

document.getElementById('btn-close-relation').addEventListener('click', () => document.getElementById('relation-modal').classList.remove('active'));

document.getElementById('btn-submit-relation').addEventListener('click', async () => {
  const sourceId = document.getElementById('rel-source').value;
  const cibleId = document.getElementById('rel-cible').value;
  const type = document.getElementById('rel-type').value;
  const message = document.getElementById('rel-message').value;

  if (!sourceId || !cibleId || !message) { alert("Remplis tous les champs."); return; }
  if (sourceId === cibleId) { alert("Impossible de lier un personnage à lui-même !"); return; }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: ficheSource } = await supabase.from('fiches_oc').select('nom').eq('id', sourceId).single();
  const { data: ficheCible } = await supabase.from('fiches_oc').select('nom').eq('id', cibleId).single();

  const sujet = `Relation: ${ficheSource.nom} & ${ficheCible.nom}`;
  const description = `Type de lien : ${type}\n\nMessage : ${message}`;

  const { error } = await supabase.from('tickets').insert({ user_id: user.id, type_ticket: 'relation', sujet: sujet, description: description });

  if (error) { alert("Erreur : " + error.message); } 
  else {
    document.getElementById('relation-modal').classList.remove('active');
    const toast = document.getElementById('toast-success');
    toast.querySelector('h4').textContent = "Demande envoyée !"; toast.querySelector('p').textContent = "Le staff va valider.";
    toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('show'), 50); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);
    loadMyRelations();
  }
});

// ==========================================
// --- PROFIL (JOUEUR & GESTION RÔLES) ---
// ==========================================
async function loadProfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userEl = document.getElementById('profile-username');
  if(userEl) userEl.textContent = user.user_metadata.full_name || "Joueur";
  const avatarEl = document.getElementById('profile-avatar');
  if(avatarEl) avatarEl.src = user.user_metadata.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile) { 
    const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id }).select().single(); 
    profile = newProfile; 
  }

  // --- 1. AFFICHAGE DES 3 BADGES ---
  const roleApp = profile?.role_app || 'JOUEUR';
  const roleRp = profile?.role_rp || 'Aucun';
  const clan = profile?.clan || 'Aucun';

  const appBadge = document.getElementById('profile-app-badge');
  if (appBadge) appBadge.textContent = `APP: ${roleApp}`;

  const rpBadge = document.getElementById('profile-rp-badge');
  if (rpBadge) rpBadge.textContent = `RP: ${roleRp}`;

  const clanBadge = document.getElementById('profile-clan-badge');
  if (clanBadge) clanBadge.textContent = `Clan: ${clan}`;

  // --- 2. AFFICHAGE DES BOUTONS ---
  const btnRpPanel = document.getElementById('btn-rp-panel');
  if (btnRpPanel) {
    if (roleRp.toLowerCase().includes('chef')) {
      btnRpPanel.style.display = 'flex';
      btnRpPanel.onclick = () => openRpPanel();
    } else { 
      btnRpPanel.style.display = 'none'; 
    }
  }

  const btnAdmin = document.getElementById('btn-admin-panel');
  if (btnAdmin) {
    if (roleApp.toUpperCase().trim() === 'ADMIN' || roleApp.toUpperCase().trim() === 'MJ') {
      btnAdmin.style.display = 'flex';
    } else { 
      btnAdmin.style.display = 'none'; 
    }
  }

  // --- 3. RÉPUTATION ---
  const pts = profile ? profile.reputation_points : 0;
  let title = "Inconnu", nextThreshold = 25;
  if (pts >= 25 && pts < 50) { title = "Loyal"; nextThreshold = 50; }
  else if (pts >= 50 && pts < 80) { title = "Fiable"; nextThreshold = 80; }
  else if (pts >= 80 && pts < 120) { title = "Respecté"; nextThreshold = 120; }
  else if (pts >= 120 && pts < 170) { title = "Vétéran"; nextThreshold = 170; }
  else if (pts >= 170 && pts < 230) { title = "Stratège"; nextThreshold = 230; }
  else if (pts >= 230 && pts < 300) { title = "Légende"; nextThreshold = 300; }
  else if (pts >= 300 && pts < 400) { title = "Étoile Vivante"; nextThreshold = 400; }
  else if (pts >= 400 && pts < 500) { title = "Immortel"; nextThreshold = 500; }
  else if (pts >= 500) { title = "Au-delà des Lunes"; nextThreshold = 500; }

  const ptsEl = document.getElementById('profile-rep-points');
  if(ptsEl) ptsEl.textContent = `${pts} pts`;
  const repTitleEl = document.getElementById('profile-rep-title');
  if(repTitleEl) repTitleEl.textContent = title;
  const repFillEl = document.getElementById('profile-rep-fill');
  if(repFillEl) repFillEl.style.width = `${Math.min((pts / nextThreshold) * 100, 100)}%`;
  const repNextEl = document.getElementById('profile-rep-next');
  if(repNextEl) repNextEl.textContent = `Prochain rang : ${nextThreshold} pts`;

  const banner = document.getElementById('profile-banner');
  if (banner) {
    if (profile && profile.banner_url) { banner.style.backgroundImage = `url('${profile.banner_url}')`; } 
    else { banner.style.backgroundImage = `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop')`; }
  }

  const { data: fiches } = await supabase.from('fiches_oc').select('nom, image_url, statut').eq('user_id', user.id);
  const ocContainer = document.getElementById('profile-oc-preview');
  if(ocContainer) {
    ocContainer.innerHTML = ''; 
    document.getElementById('profile-oc-count').textContent = `${fiches ? fiches.length : 0} / 5`;

    if (fiches && fiches.length > 0) {
      fiches.forEach(fiche => {
        const img = fiche.image_url ? fiche.image_url : 'https://cdn.discordapp.com/embed/avatars/0.png';
        ocContainer.innerHTML += `<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" onclick="document.querySelector('[data-target=\\'fiches\\']').click()"><div style="width: 50px; height: 50px; border-radius: 50%; background-image: url('${img}'); background-size: cover; background-position: center; border: 2px solid ${fiche.statut === 'Validée' ? '#10b981' : '#fbbf24'};"></div><span style="font-size: 0.7rem; margin-top: 5px; color: white;">${fiche.nom.split(' ')[0]}</span></div>`;
      });
    } else { ocContainer.innerHTML = '<p style="color: gray; font-size: 0.9rem;">Aucune fiche.</p>'; }
  }
}

document.getElementById('btn-logout').addEventListener('click', async () => { await supabase.auth.signOut(); window.location.reload(); });

// ==========================================
// --- PANEL DE GESTION RP (CHEF) ---
// ==========================================
document.getElementById('btn-close-rp-panel').addEventListener('click', () => {
  document.getElementById('rp-panel-modal').classList.remove('active');
});

async function openRpPanel() {
  document.getElementById('rp-panel-modal').classList.add('active');
  const container = document.getElementById('rp-members-list');
  container.innerHTML = '<p style="color: gray; text-align: center;">Chargement des membres...</p>';

  const { data: { user } } = await supabase.auth.getUser();
  const { data: myFiche } = await supabase.from('fiches_oc').select('clan').eq('user_id', user.id).eq('statut', 'Validée').single();
  
  if (!myFiche) {
    container.innerHTML = '<p style="color: red; text-align: center;">Erreur : Impossible de trouver ton clan (as-tu une fiche validée ?).</p>';
    return;
  }

  const { data: membres, error } = await supabase.from('fiches_oc').select('id, nom, rang, user_id, image_url').eq('clan', myFiche.clan).eq('statut', 'Validée');

  if (error || membres.length === 0) {
    container.innerHTML = `<p style="color: gray; text-align: center;">Aucun membre validé dans le ${myFiche.clan}.</p>`;
    return;
  }

  container.innerHTML = '';
  membres.forEach(membre => {
    const isSelf = membre.user_id === user.id;
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.style.padding = '15px';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background-image: url('${membre.image_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}'); background-size: cover; background-position: center; border: 1px solid var(--accent);"></div>
          <div>
            <h4 style="font-family: var(--font-title); color: var(--accent); font-size: 1.1rem; margin: 0;">${membre.nom}</h4>
            <span style="font-size: 0.8rem; color: gray;">Rang : ${membre.rang}</span>
          </div>
        </div>
        ${!isSelf ? `
        <div style="display: flex; gap: 5px;">
          <button class="btn-action btn-modifier" style="font-size: 0.7rem; padding: 5px 10px;" onclick="promoteMember('${membre.id}', '${membre.rang}')">Promouvoir</button>
          <button class="btn-action btn-supprimer" style="font-size: 0.7rem; padding: 5px 10px;" onclick="exileMember('${membre.id}')">Exiler</button>
        </div>` : '<span style="font-size: 0.8rem; color: var(--accent); font-weight: bold;">(Vous)</span>'}
      </div>
    `;
    container.appendChild(card);
  });
}

window.promoteMember = async function(ficheId, currentRang) {
  const newRang = prompt(`Rang actuel : ${currentRang}\n\nQuel est le nouveau rang de ce membre ?`, currentRang);
  if (newRang && newRang !== currentRang) {
    const { error } = await supabase.from('fiches_oc').update({ rang: newRang }).eq('id', ficheId);
    if (error) alert("Erreur : " + error.message);
    else { alert("Rang mis à jour !"); openRpPanel(); }
  }
};

window.exileMember = async function(ficheId) {
  if (confirm("⚠️ Es-tu sûr de vouloir exiler ce membre ?")) {
    const { error } = await supabase.from('fiches_oc').update({ clan: 'Solitaire', rang: 'Solitaire' }).eq('id', ficheId);
    if (error) alert("Erreur : " + error.message);
    else { alert("Membre exilé !"); openRpPanel(); }
  }
};

// ==========================================
// --- CARTE INTERACTIVE ---
// ==========================================
setTimeout(() => {
  const mapContent = document.getElementById('map-content');
  if (mapContent && typeof Panzoom !== 'undefined') {
    const panzoom = Panzoom(mapContent, { maxScale: 4, minScale: 1, startScale: 1, contain: 'outside', cursor: 'grab' });
    document.getElementById('map-viewport').addEventListener('wheel', panzoom.zoomWithWheel);
  }
}, 500);

const mapSheetHTML = `
  <div class="map-sheet-overlay" id="map-sheet-overlay">
    <div class="map-sheet" id="map-sheet">
      <div class="sheet-drag-handle"></div>
      <h3 id="sheet-title">Nom du lieu</h3>
      <p id="sheet-desc">Description...</p>
      <button type="button" class="btn-close-sheet" id="btn-close-sheet">Fermer</button>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', mapSheetHTML);

const lieuxData = {
  foret: { titre: "Clan de la Forêt", desc: "Discrets, furtifs et connectés à la nature. Ils préfèrent l'ombre des arbres et n'aiment pas les conflits ouverts." },
  brume: { titre: "Clan de la Brume", desc: "Mystérieux et proches des esprits. Vivant dans les marais, ils connaissent les poisons et les plantes rares." },
  zenith: { titre: "Clan du Zénith", desc: "Sages, observateurs et proches du ciel. Ils se croient investis d'une mission spirituelle et veillent sur l'équilibre." },
  pluie: { titre: "Clan de la Pluie", desc: "Agiles, imprévisibles et rapides. Maîtres des embuscades, ils utilisent l'eau et la boue pour surprendre leurs ennemis." },
  ile: { titre: "Île Lunaire", desc: "Au centre du grand lac, reliée par deux ponts dont un en ruine. C'est ici que se déroulent les grandes assemblées entre les clans." },
  source: { titre: "Source Lunaire", desc: "Une grotte souterraine sacrée. Ses eaux cristallines brillent comme des étoiles." },
  gare: { titre: "Gare Abandonnée", desc: "De vieux rails rouillés perdus dans la nature." },
  ville: { titre: "La Ville", desc: "Une petite cité humaine cachée derrière les montagnes du Zénith." }
};

document.querySelectorAll('.map-pin').forEach(pin => {
  pin.addEventListener('click', (e) => {
    const data = lieuxData[e.currentTarget.getAttribute('data-lieu')];
    if (data) {
      document.getElementById('sheet-title').textContent = data.titre;
      document.getElementById('sheet-desc').textContent = data.desc;
      document.getElementById('map-sheet-overlay').classList.add('active');
    }
  });
});
document.getElementById('btn-close-sheet').addEventListener('click', () => document.getElementById('map-sheet-overlay').classList.remove('active'));
document.getElementById('map-sheet-overlay').addEventListener('click', (e) => { if (e.target.id === 'map-sheet-overlay') e.target.classList.remove('active'); });

// ==========================================
// --- SUPPORT (TICKETS) ---
// ==========================================
document.getElementById('btn-floating-support').addEventListener('click', () => { document.getElementById('support-modal').classList.add('active'); document.getElementById('support-menu-view').style.display = 'block'; document.getElementById('support-form-view').style.display = 'none'; });
document.getElementById('btn-close-support').addEventListener('click', () => { document.getElementById('support-modal').classList.remove('active'); });
document.getElementById('btn-back-support').addEventListener('click', () => { document.getElementById('support-menu-view').style.display = 'block'; document.getElementById('support-form-view').style.display = 'none'; });

window.openSupportForm = function(type) {
  currentTicketType = type;
  document.getElementById('support-menu-view').style.display = 'none';
  document.getElementById('support-form-view').style.display = 'block';
  const formFields = document.getElementById('dynamic-form-fields');
  const formTitle = document.getElementById('support-form-title');
  let html = "";
  if (type === 'faction') { formTitle.textContent = "Créer une Faction"; html = `<div class="form-group"><label>Nom</label><input type="text" id="t-faction-nom" required /></div><div class="form-group"><label>Type</label><select id="t-faction-type"><option>Clan</option><option>Tribu</option></select></div><div class="form-group"><label>Territoire</label><input type="text" id="t-faction-territoire" /></div><div class="form-group"><label>Membres</label><input type="text" id="t-faction-membres" /></div><div class="form-group"><label>Lore</label><textarea id="t-faction-lore"></textarea></div>`; } 
  else if (type === 'famille') { formTitle.textContent = "Créer une Famille"; html = `<div class="form-group"><label>Nom</label><input type="text" id="t-famille-nom" required /></div><div class="form-group"><label>Membres</label><input type="text" id="t-famille-membres" /></div><div class="form-group"><label>Lien Clan</label><input type="text" id="t-famille-clan" /></div><div class="form-group"><label>Histoire</label><textarea id="t-famille-histoire"></textarea></div>`; }
  else if (type === 'bug') { formTitle.textContent = "Signaler un Bug"; html = `<div class="form-group"><label>Titre</label><input type="text" id="t-bug-titre" required /></div><div class="form-group"><label>Appareil</label><select id="t-bug-appareil"><option>Mobile</option><option>PC</option></select></div><div class="form-group"><label>Description</label><textarea id="t-bug-desc"></textarea></div>`; }
  else if (type === 'suggestion') { formTitle.textContent = "Suggestion"; html = `<div class="form-group"><label>Titre</label><input type="text" id="t-sugg-titre" required /></div><div class="form-group"><label>Catégorie</label><select id="t-sugg-cat"><option>Site</option><option>RP</option></select></div><div class="form-group"><label>Idée</label><textarea id="t-sugg-desc"></textarea></div>`; }
  else if (type === 'joueur') { formTitle.textContent = "Signaler un Joueur"; html = `<div class="form-group"><label>Pseudo</label><input type="text" id="t-joueur-pseudo" required /></div><div class="form-group"><label>Motif</label><select id="t-joueur-motif"><option>HRP</option><option>Harcèlement</option></select></div><div class="form-group"><label>Description</label><textarea id="t-joueur-desc"></textarea></div>`; }
  else if (type === 'staff') { formTitle.textContent = "Rejoindre le Staff"; html = `<div class="form-group"><label>Pseudo</label><input type="text" id="t-staff-pseudo" required /></div><div class="form-group"><label>Âge</label><input type="text" id="t-staff-age" required /></div><div class="form-group"><label>Poste</label><select id="t-staff-poste"><option>Modérateur</option><option>MJ</option></select></div><div class="form-group"><label>Motivations</label><textarea id="t-staff-motiv"></textarea></div><div class="form-group"><label>Dispo</label><input type="text" id="t-staff-dispo" /></div>`; }
  formFields.innerHTML = html;
};

document.getElementById('btn-submit-ticket').addEventListener('click', async () => {
  let sujet = "", description = "";
  try {
    if (currentTicketType === 'faction') { sujet = "Faction: " + document.getElementById('t-faction-nom').value; description = `Type: ${document.getElementById('t-faction-type').value}\nMembres: ${document.getElementById('t-faction-membres').value}\n\n${document.getElementById('t-faction-lore').value}`; } 
    else if (currentTicketType === 'famille') { sujet = "Famille: " + document.getElementById('t-famille-nom').value; description = `Membres: ${document.getElementById('t-famille-membres').value}\n\n${document.getElementById('t-famille-histoire').value}`; }
    else if (currentTicketType === 'bug') { sujet = "Bug: " + document.getElementById('t-bug-titre').value; description = `Appareil: ${document.getElementById('t-bug-appareil').value}\n\n${document.getElementById('t-bug-desc').value}`; }
    else if (currentTicketType === 'suggestion') { sujet = "Suggestion: " + document.getElementById('t-sugg-titre').value; description = `Catégorie: ${document.getElementById('t-sugg-cat').value}\n\n${document.getElementById('t-sugg-desc').value}`; }
    else if (currentTicketType === 'joueur') { sujet = "Signalement: " + document.getElementById('t-joueur-pseudo').value; description = `Motif: ${document.getElementById('t-joueur-motif').value}\n\n${document.getElementById('t-joueur-desc').value}`; }
    else if (currentTicketType === 'staff') { sujet = "Candidature: " + document.getElementById('t-staff-pseudo').value; description = `Age: ${document.getElementById('t-staff-age').value}\nPoste: ${document.getElementById('t-staff-poste').value}\n\n${document.getElementById('t-staff-motiv').value}`; }
  } catch(e) { alert("Remplis les champs."); return; }

  if (!sujet || sujet.endsWith(':')) { alert("Remplis le titre."); return; }

  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('tickets').insert({ user_id: user.id, type_ticket: currentTicketType, sujet: sujet, description: description });
  if (error) { alert("Erreur : " + error.message); } 
  else {
    document.getElementById('support-modal').classList.remove('active');
    const toast = document.getElementById('toast-success');
    toast.querySelector('h4').textContent = "Ticket envoyé !";
    toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('show'), 50); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);
  }
});

// ==========================================
// --- PARAMÈTRES ---
// ==========================================
const settingsModal = document.getElementById('settings-modal');
document.getElementById('btn-open-settings').addEventListener('click', () => settingsModal.classList.add('active'));
document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('active'));

document.getElementById('btn-open-credits').addEventListener('click', () => {
  settingsModal.classList.remove('active'); screenApp.classList.remove('active'); screenCredits.classList.add('active');
  const btnContinue = document.getElementById('btn-continue-credits');
  btnContinue.textContent = "Retour à l'application";
  btnContinue.onclick = () => { screenCredits.classList.remove('active'); screenApp.classList.add('active'); btnContinue.textContent = "Entrer dans les Terres du Crépuscule"; btnContinue.onclick = null; window.location.reload(); };
});

// ==========================================
// --- BASCULE ADMIN & GESTION ---
// ==========================================
document.getElementById('btn-admin-panel').addEventListener('click', () => {
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-admin').classList.add('active');
  loadAdminFiches();
  loadAdminMembres();
  loadAdminTickets();
});

document.getElementById('btn-quit-admin').addEventListener('click', () => {
  document.getElementById('screen-admin').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
});

document.querySelectorAll('[data-admin-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('[data-admin-target]').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('#screen-admin .view').forEach(v => v.classList.remove('active'));
    document.getElementById(`admin-view-${e.currentTarget.getAttribute('data-admin-target')}`).classList.add('active');
  });
});

async function loadAdminFiches() {
  const container = document.getElementById('admin-fiches-list');
  const { data: fiches } = await supabase.from('fiches_oc').select('*').eq('statut', 'En attente');
  if (!fiches || fiches.length === 0) { container.innerHTML = '<p style="color: #10b981;">Aucune fiche en attente.</p>'; return; }
  container.innerHTML = '';
  fiches.forEach(fiche => {
    container.innerHTML += `
      <div class="profile-card" style="margin-bottom: 10px;">
        <h4 style="color: var(--accent); margin-bottom: 5px;">${fiche.nom} <span style="font-size: 0.7rem; color: gray;">(${fiche.clan})</span></h4>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn-action" style="background: rgba(16, 185, 129, 0.2); color: #10b981;" onclick="validerFicheAdmin('${fiche.id}')">✅ Valider</button>
          <button class="btn-action" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="refuserFicheAdmin('${fiche.id}')">❌ Refuser</button>
        </div>
      </div>
    `;
  });
}
window.validerFicheAdmin = async function(id) { await supabase.from('fiches_oc').update({ statut: 'Validée' }).eq('id', id); loadAdminFiches(); };
window.refuserFicheAdmin = async function(id) { await supabase.from('fiches_oc').update({ statut: 'Refusée' }).eq('id', id); loadAdminFiches(); };

async function loadAdminMembres() {
  const container = document.getElementById('admin-membres-list');
  if(!container) return;
  const { data: profils } = await supabase.from('profiles').select('*');
  if (!profils || profils.length === 0) return;
  container.innerHTML = '';
  
  profils.forEach(profil => {
    container.innerHTML += `
      <div class="profile-card" style="margin-bottom: 10px;">
        <p style="font-size: 0.8rem; color: gray; margin-bottom: 5px;">ID: ${profil.id.substring(0, 8)}</p>
        
        <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Rôle APP :</strong> ${profil.role_app || 'JOUEUR'}</p>
          <p style="margin: 0; font-size: 0.85rem;"><strong>Rôle RP :</strong> ${profil.role_rp || 'Aucun'}</p>
          <p style="margin: 0; font-size: 0.85rem;"><strong>Clan :</strong> ${profil.clan || 'Aucun'}</p>
        </div>
        
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
          <button class="btn-action btn-modifier" onclick="changerRoleApp('${profil.id}')">Modif APP</button>
          <button class="btn-action btn-modifier" onclick="changerRoleRP('${profil.id}')">Modif RP</button>
          <button class="btn-action btn-modifier" onclick="changerClan('${profil.id}')">Modif Clan</button>
        </div>
      </div>
    `;
  });
}

window.changerRoleRP = async function(id) {
  const newRole = prompt("Nouveau rôle RP (Chef, Guérisseur, Guerrier...) :");
  if (newRole) { await supabase.from('profiles').update({ role_rp: newRole }).eq('id', id); loadAdminMembres(); }
};

window.changerClan = async function(id) {
  const newClan = prompt("Nouveau Clan (Forêt, Pluie, Zénith, Brume, Solitaire...) :");
  if (newClan) { await supabase.from('profiles').update({ clan: newClan }).eq('id', id); loadAdminMembres(); }
};

window.changerRoleRP = async function(id) {
  const newRole = prompt("Nouveau rôle RP (Chef, Guérisseur, Guerrier...) :");
  if (newRole) { await supabase.from('profiles').update({ role_rp: newRole }).eq('id', id); loadAdminMembres(); }
};

window.changerClan = async function(id) {
  const newClan = prompt("Nouveau Clan (Forêt, Pluie, Zénith, Brume, Solitaire...) :");
  if (newClan) { await supabase.from('profiles').update({ clan: newClan }).eq('id', id); loadAdminMembres(); }
};

window.changerRoleApp = async function(id) {
  const newRole = prompt("Nouveau rôle APP (ADMIN, MJ, JOUEUR) :");
  if (newRole) { await supabase.from('profiles').update({ role_app: newRole.toUpperCase() }).eq('id', id); loadAdminMembres(); }
};

async function loadAdminTickets() {
  const container = document.getElementById('admin-tickets-list');
  if(!container) return;
  const { data: tickets } = await supabase.from('tickets').select('*').order('date_creation', { ascending: false });
  
  if (!tickets || tickets.length === 0) { 
    container.innerHTML = '<p style="color: gray;">Aucun ticket.</p>'; 
    return; 
  }
  
  container.innerHTML = '';
  tickets.forEach(t => {
    container.innerHTML += `
      <div class="profile-card" style="margin-bottom: 15px; border-left: 3px solid var(--accent);">
        <h4 style="font-size: 1rem; color: #fff;">${t.sujet} <span style="font-size: 0.7rem; color: gray;">[${t.statut || 'Ouvert'}]</span></h4>
        <p style="font-size: 0.75rem; color: gray; margin-bottom: 8px;">Type: ${t.type_ticket} | ID Joueur: ${t.user_id.substring(0, 6)}</p>
        <p style="font-size: 0.9rem; color: #cbd5e1; white-space: pre-wrap;">${t.description}</p>
        
        ${t.reponse_joueur ? `<div style="background: rgba(96,165,250,0.1); padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 2px solid #60a5fa;"><p style="font-size: 0.85rem; color: #60a5fa; font-weight: bold; margin-bottom: 2px;">Message du Joueur :</p><p style="font-size: 0.9rem; color: #fff;">${t.reponse_joueur}</p></div>` : ''}
        ${t.reponse_staff ? `<div style="background: rgba(16,185,129,0.1); padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 2px solid #10b981;"><p style="font-size: 0.85rem; color: #10b981; font-weight: bold; margin-bottom: 2px;">Votre Réponse :</p><p style="font-size: 0.9rem; color: #fff;">${t.reponse_staff}</p></div>` : ''}
        
        <div style="margin-top: 15px; display: flex; gap: 5px;">
          <input type="text" id="admin-reply-${t.id}" placeholder="Répondre au joueur..." style="flex: 1; padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.1);" />
          <button class="btn-action btn-modifier" style="padding: 10px; width: auto; background: rgba(16,185,129,0.2); color: #10b981;" onclick="replyAdminTicket('${t.id}')">Répondre</button>
        </div>
      </div>
    `;
  });
}

window.replyAdminTicket = async function(id) {
  const input = document.getElementById(`admin-reply-${id}`).value;
  if(!input) return;
  const { error } = await supabase.from('tickets').update({ reponse_staff: input, statut: 'Répondu' }).eq('id', id);
  if(error) alert("Erreur : " + error.message);
  else { alert("Réponse envoyée au joueur !"); loadAdminTickets(); }
};

// ==========================================
// --- ACTUALITÉS (ACCUEIL) ---
// ==========================================
window.publierActu = async function() {
  const contenu = document.getElementById('admin-actu-input').value;
  if (!contenu) return alert("Écris un message.");
  
  const { error } = await supabase.from('actualites').insert({ contenu });
  if (error) alert(error.message);
  else {
    document.getElementById('admin-actu-input').value = '';
    alert("Message publié !");
    loadActualites();
  }
};

async function loadActualites() {
  const container = document.getElementById('actualites-container');
  if (!container) return;
  
  const { data } = await supabase.from('actualites').select('*').order('date_publication', { ascending: false }).limit(5);
  if (!data || data.length === 0) return;

  container.innerHTML = data.map(actu => `
    <div class="feed-card" style="border-left: 4px solid var(--accent); margin-bottom: 10px;">
      <p style="font-size: 0.95rem; color: #fff;">${actu.contenu}</p>
    </div>
  `).join('');
}
loadActualites();

// ==========================================
// --- CHRONIQUES (MJ) ---
// ==========================================
window.publierChronique = async function() {
  const titre = document.getElementById('admin-chro-titre').value;
  const contenu = document.getElementById('admin-chro-contenu').value;
  if (!titre || !contenu) return alert("Remplis le titre et le contenu.");
  
  const { error } = await supabase.from('chroniques').insert({ titre, contenu });
  if (error) alert(error.message);
  else {
    document.getElementById('admin-chro-titre').value = '';
    document.getElementById('admin-chro-contenu').value = '';
    alert("Chronique publiée !");
    loadChroniques();
  }
};

async function loadChroniques() {
  const container = document.getElementById('chroniques-container');
  if (!container) return;

  const { data } = await supabase.from('chroniques').select('*').order('date_publication', { ascending: false });
  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color: gray; text-align: center;">Aucune chronique pour le moment.</p>';
    return;
  }

  container.innerHTML = data.map(chro => `
    <div class="feed-card" style="margin-bottom: 15px;">
      <div class="feed-header"><span class="author">${chro.auteur}</span></div>
      <h3>${chro.titre}</h3>
      <p>${chro.contenu}</p>
    </div>
  `).join('');
}
loadChroniques();

// ==========================================
// --- MES TICKETS (JOUEUR) ---
// ==========================================
document.getElementById('btn-my-tickets')?.addEventListener('click', () => {
  document.getElementById('player-tickets-modal').classList.add('active');
  loadPlayerTickets();
});

async function loadPlayerTickets() {
  const container = document.getElementById('player-tickets-list');
  if(!container) return;
  container.innerHTML = '<p style="color: gray; text-align: center;">Chargement...</p>';
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tickets } = await supabase.from('tickets').select('*').eq('user_id', user.id).order('date_creation', { ascending: false });

  if (!tickets || tickets.length === 0) {
    container.innerHTML = '<p style="color: gray; text-align: center;">Tu n\'as aucun ticket pour le moment.</p>';
    return;
  }

  container.innerHTML = '';
  tickets.forEach(t => {
    container.innerHTML += `
      <div class="profile-card" style="margin-bottom: 15px; border-left: 3px solid var(--accent);">
        <h4 style="color: var(--accent); margin-bottom: 5px;">${t.sujet} <span style="font-size: 0.7rem; color: gray;">[${t.statut || 'Ouvert'}]</span></h4>
        <p style="font-size: 0.9rem; color: #cbd5e1; white-space: pre-wrap;">${t.description}</p>
        
        ${t.reponse_staff ? `<div style="background: rgba(16,185,129,0.1); padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 2px solid #10b981;"><p style="font-size: 0.85rem; color: #10b981; font-weight: bold; margin-bottom: 2px;">Réponse du Staff :</p><p style="font-size: 0.9rem; color: #fff;">${t.reponse_staff}</p></div>` : ''}
        ${t.reponse_joueur ? `<div style="background: rgba(96,165,250,0.1); padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 2px solid #60a5fa;"><p style="font-size: 0.85rem; color: #60a5fa; font-weight: bold; margin-bottom: 2px;">Ton message :</p><p style="font-size: 0.9rem; color: #fff;">${t.reponse_joueur}</p></div>` : ''}
        
        <div style="margin-top: 15px; display: flex; gap: 5px;">
          <input type="text" id="reply-${t.id}" placeholder="Répondre au staff..." style="flex: 1; padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.1);" />
          <button class="btn-action btn-modifier" style="padding: 10px; width: auto;" onclick="replyTicket('${t.id}')">Envoyer</button>
        </div>
      </div>
    `;
  });
}

window.replyTicket = async function(id) {
  const input = document.getElementById(`reply-${id}`).value;
  if(!input) return;
  const { error } = await supabase.from('tickets').update({ reponse_joueur: input }).eq('id', id);
  if(error) alert("Erreur : " + error.message);
  else { alert("Message envoyé au staff !"); loadPlayerTickets(); }
};