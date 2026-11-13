import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lrkiivqbnkkduxfcrbjn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2lpdnFibmtrZHV4ZmNyYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTI0MTMsImV4cCI6MjExMDA4ODQxM30.jpDPREZttmd__dVy2Uy3DdmjRUPQtdd_nUoJWAyOO6Y"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let editingFicheId = null; 
let currentEditingImage = ""; 

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

// --- NAVIGATION GLOBALE (CORRIGÉE) ---
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
    if(target === 'monde') document.getElementById('view-monde').classList.add('active');
    if(target === 'profil') {
      document.getElementById('view-profil').classList.add('active');
      loadProfil(); // <--- On charge les données du profil ici
    }
  });
});

// --- ONGLETS DU MONDE ---
const mondeTabBtns = document.querySelectorAll('.monde-tab-btn');
const mondeContents = document.querySelectorAll('.monde-content');
mondeTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    mondeTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    mondeContents.forEach(c => c.classList.remove('active'));
    document.getElementById(`monde-${e.currentTarget.getAttribute('data-monde')}`).classList.add('active');
  });
});

const loreTabBtns = document.querySelectorAll('.lore-tab-btn');
const loreContents = document.querySelectorAll('.lore-content');
loreTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    loreTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    loreContents.forEach(c => c.classList.remove('active'));
    document.getElementById(`lore-${e.currentTarget.getAttribute('data-lore')}`).classList.add('active');
  });
});

// --- ONGLETS FICHES ---
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
    btnNext.textContent = editingFicheId ? 'Mettre à jour la fiche' : 'Soumettre la fiche';
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
      loadMyFiches();
      loadAllFiches(); 
    }
  }
});

// --- LOGIQUE DES STATS ---
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

// --- APERÇU DE L'IMAGE ---
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

// --- AFFICHAGE (MES FICHES) ---
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
document.querySelector('[data-sub="mine"]').addEventListener('click', loadMyFiches);

// --- FONCTIONS GLOBALES MODIFIER ET SUPPRIMER ---
window.editFiche = async function(id) {
  const confirmModif = confirm("⚠️ ATTENTION : Si tu modifies ta fiche, elle repassera en 'En attente' et ne sera plus visible sur le site jusqu'à ce qu'un Admin la revalide. Continuer ?");
  if (!confirmModif) return;

  const { data: fiche, error } = await supabase.from('fiches_oc').select('*').eq('id', id).single();
  if (error || !fiche) return alert("Erreur lors du chargement.");

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
  if (fiche.image_url) { preview.src = fiche.image_url; preview.style.display = 'block'; } 
  else { preview.style.display = 'none'; }

  document.getElementById('stat-force').value = fiche.stats_force || 1;
  document.getElementById('stat-agilite').value = fiche.stats_agilite || 1;
  document.getElementById('stat-endurance').value = fiche.stats_endurance || 1;
  document.getElementById('stat-ruse').value = fiche.stats_ruse || 1;
  document.getElementById('stat-charisme').value = fiche.stats_charisme || 1;
  updateStats();

  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.subview').forEach(v => v.classList.remove('active'));
  document.querySelector('.sub-tab-btn[data-sub="create"]').classList.add('active');
  document.getElementById('subview-create').classList.add('active');

  currentStep = 1;
  updateWizard();
};

window.deleteFiche = async function(id) {
  if(confirm("Es-tu sûr de vouloir supprimer cette fiche ? Cette action est irréversible.")) {
    const { error } = await supabase.from('fiches_oc').delete().eq('id', id);
    if (error) alert("Erreur lors de la suppression.");
    else loadMyFiches();
  }
};

// --- AFFICHAGE (VOIR LES FICHES) ---
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

// --- PAGE DE DÉTAIL ---
function openFicheDetail(fiche) {
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

  const imgContainer = document.getElementById('detail-image');
  if (fiche.image_url && fiche.image_url.trim() !== '') {
    imgContainer.style.backgroundImage = `url('${fiche.image_url}')`;
    imgContainer.style.display = 'block';
  } else {
    imgContainer.style.display = 'none';
  }

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

// --- LOGIQUE DU PROFIL (AVEC VRAIE RÉPUTATION) ---
async function loadProfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Infos Discord
  const username = user.user_metadata.full_name || "Joueur Inconnu";
  const avatarUrl = user.user_metadata.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";
  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-avatar').src = avatarUrl;

  // 2. Récupérer ou CRÉER le profil dans la base de données
  let { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  if (!profile) {
    // Si le joueur n'a pas de profil (première connexion), on le crée
    const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id }).select().single();
    profile = newProfile;
  }

  // 3. Calculer le Rang en fonction des points
  const pts = profile ? profile.reputation_points : 0;
  let title = "Inconnu";
  let nextThreshold = 25;

  if (pts >= 25 && pts < 50) { title = "Loyal"; nextThreshold = 50; }
  else if (pts >= 50 && pts < 80) { title = "Fiable"; nextThreshold = 80; }
  else if (pts >= 80 && pts < 120) { title = "Respecté"; nextThreshold = 120; }
  else if (pts >= 120 && pts < 170) { title = "Vétéran"; nextThreshold = 170; }
  else if (pts >= 170 && pts < 230) { title = "Stratège"; nextThreshold = 230; }
  else if (pts >= 230 && pts < 300) { title = "Légende"; nextThreshold = 300; }
  else if (pts >= 300 && pts < 400) { title = "Étoile Vivante"; nextThreshold = 400; }
  else if (pts >= 400 && pts < 500) { title = "Immortel"; nextThreshold = 500; }
  else if (pts >= 500) { title = "Au-delà des Lunes"; nextThreshold = 500; }

  // 4. Afficher la réputation
  document.getElementById('profile-rep-points').textContent = `${pts} pts`;
  document.getElementById('profile-rep-title').textContent = title;
  document.getElementById('profile-rep-fill').style.width = `${(pts / nextThreshold) * 100}%`;
  document.getElementById('profile-rep-next').textContent = `Prochain rang : ${nextThreshold} pts`;

  // 5. Gérer la bannière (Image de fond)
  const banner = document.getElementById('profile-banner');
  if (profile && profile.banner_url) {
    banner.style.backgroundImage = `url('${profile.banner_url}')`;
  } else {
    banner.style.backgroundImage = `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop')`; // Image par défaut
  }

  // 6. Récupérer les fiches OC
  const { data: fiches } = await supabase.from('fiches_oc').select('nom, image_url, statut').eq('user_id', user.id);
  const ocContainer = document.getElementById('profile-oc-preview');
  const ocCount = document.getElementById('profile-oc-count');
  ocContainer.innerHTML = ''; 

  const fichesLength = fiches ? fiches.length : 0;
  ocCount.textContent = `${fichesLength} / 5`;

  if (fiches && fiches.length > 0) {
    fiches.forEach(fiche => {
      const img = fiche.image_url ? fiche.image_url : 'https://cdn.discordapp.com/embed/avatars/0.png';
      ocContainer.innerHTML += `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" onclick="document.querySelector('[data-target=\\'fiches\\']').click()">
          <div style="width: 50px; height: 50px; border-radius: 50%; background-image: url('${img}'); background-size: cover; background-position: center; border: 2px solid ${fiche.statut === 'Validée' ? '#10b981' : '#fbbf24'};"></div>
          <span style="font-size: 0.7rem; margin-top: 5px; color: white;">${fiche.nom.split(' ')[0]}</span>
        </div>
      `;
    });
  } else {
    ocContainer.innerHTML = '<p style="color: gray; font-size: 0.9rem;">Aucune fiche pour le moment.</p>';
  }
}

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

document.getElementById('btn-admin-panel').style.display = 'block';

// --- CARTE INTERACTIVE ET TIROIR GLISSANT ---

// 1. Création du Tiroir (Bottom Sheet) invisible
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

// 2. Les données des lieux
const lieuxData = {
  foret: {
    titre: "Clan de la Forêt",
    desc: "Discrets, furtifs et connectés à la nature. Ils préfèrent l'ombre des arbres et n'aiment pas les conflits ouverts.",
    isClan: true
  },
  brume: {
    titre: "Clan de la Brume",
    desc: "Mystérieux et proches des esprits. Vivant dans les marais, ils connaissent les poisons et les plantes rares.",
    isClan: true
  },
  zenith: {
    titre: "Clan du Zénith",
    desc: "Sages, observateurs et proches du ciel. Ils se croient investis d'une mission spirituelle et veillent sur l'équilibre.",
    isClan: true
  },
  pluie: {
    titre: "Clan de la Pluie",
    desc: "Agiles, imprévisibles et rapides. Maîtres des embuscades, ils utilisent l'eau et la boue pour surprendre leurs ennemis.",
    isClan: true
  },
  ile: {
    titre: "Île Lunaire",
    desc: "Au centre du grand lac, reliée par deux ponts dont un en ruine. C'est ici que se déroulent les grandes assemblées entre les clans.",
    isClan: false
  },
  source: {
    titre: "Source Lunaire",
    desc: "Une grotte souterraine sacrée. Ses eaux cristallines brillent comme des étoiles et permettent aux guérisseurs de communiquer avec le Clan de la Lune.",
    isClan: false
  },
  gare: {
    titre: "Gare Abandonnée",
    desc: "De vieux rails rouillés perdus dans la nature. Un vestige d'une époque lointaine, aujourd'hui recouvert par la végétation.",
    isClan: false
  },
  ville: {
    titre: "La Ville",
    desc: "Une petite cité humaine cachée derrière les montagnes du Zénith. Les chats évitent généralement cet endroit bruyant et dangereux.",
    isClan: false
  }
};

// 3. Logique d'ouverture du tiroir
document.querySelectorAll('.map-pin').forEach(pin => {
  pin.addEventListener('click', (e) => {
    const lieuId = e.currentTarget.getAttribute('data-lieu');
    const data = lieuxData[lieuId];
    
    if (data) {
      document.getElementById('sheet-title').textContent = data.titre;
      document.getElementById('sheet-desc').textContent = data.desc;
      
      // Ouvre le tiroir
      document.getElementById('map-sheet-overlay').classList.add('active');
    }
  });
});

// 4. Fermeture du tiroir
document.getElementById('btn-close-sheet').addEventListener('click', () => {
  document.getElementById('map-sheet-overlay').classList.remove('active');
});

document.getElementById('map-sheet-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'map-sheet-overlay') {
    e.target.classList.remove('active');
  }
});

// --- INITIALISATION DU ZOOM (PANZOOM) ---
// On attend un petit peu que la page charge
setTimeout(() => {
  const mapContent = document.getElementById('map-content');
  if (mapContent && typeof Panzoom !== 'undefined') {
    // On active le zoom et le déplacement sur le contenu de la carte
    const panzoom = Panzoom(mapContent, {
      maxScale: 4,       // Zoom maximum (x4)
      minScale: 1,       // Zoom minimum (x1)
      contain: 'outside', // Empêche de perdre la carte
      cursor: 'grab'
    });

    // Activer le zoom avec la molette de la souris
    document.getElementById('map-viewport').addEventListener('wheel', panzoom.zoomWithWheel);
  }
}, 500); // On attend 500ms que l'image soit là

const panzoom = Panzoom(mapContent, {
  maxScale: 4,       
  minScale: 1,       
  startScale: 1, // <-- AJOUTE CETTE LIGNE
  contain: 'outside', 
  cursor: 'grab'
});

// --- LOGIQUE DU SUPPORT (TICKETS) ---
let currentTicketType = "";

// Ouvrir le menu
document.getElementById('btn-floating-support').addEventListener('click', () => {
  document.getElementById('support-modal').classList.add('active');
  document.getElementById('support-menu-view').style.display = 'block';
  document.getElementById('support-form-view').style.display = 'none';
});

// Fermer le menu
document.getElementById('btn-close-support').addEventListener('click', () => {
  document.getElementById('support-modal').classList.remove('active');
});

// Retour arrière (du formulaire vers le menu)
document.getElementById('btn-back-support').addEventListener('click', () => {
  document.getElementById('support-menu-view').style.display = 'block';
  document.getElementById('support-form-view').style.display = 'none';
});

// Ouvrir un formulaire spécifique
window.openSupportForm = function(type) {
  currentTicketType = type;
  document.getElementById('support-menu-view').style.display = 'none';
  document.getElementById('support-form-view').style.display = 'block';
  
  // Changer le titre selon le bouton cliqué
  const titles = {
    clan: "Créer un clan",
    famille: "Créer une famille",
    suggestion: "Faire une suggestion",
    staff: "Rejoindre le staff",
    bug: "Signaler un bug",
    joueur: "Signaler un joueur"
  };
  document.getElementById('support-form-title').textContent = titles[type];
  
  // Vider les champs
  document.getElementById('support-sujet').value = '';
  document.getElementById('support-description').value = '';
};

// Envoyer le ticket à Supabase
document.getElementById('btn-submit-ticket').addEventListener('click', async () => {
  const sujet = document.getElementById('support-sujet').value;
  const description = document.getElementById('support-description').value;

  if (!sujet || !description) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Tu dois être connecté.");

  // Envoi à la base de données
  const { error } = await supabase.from('tickets').insert({
    user_id: user.id,
    type_ticket: currentTicketType,
    sujet: sujet,
    description: description
  });

  if (error) {
    alert("Erreur lors de l'envoi : " + error.message);
  } else {
    // Succès !
    document.getElementById('support-modal').classList.remove('active');
    
    // On réutilise ton popup de succès (toast)
    const toast = document.getElementById('toast-success');
    toast.querySelector('h4').textContent = "Ticket envoyé !";
    toast.querySelector('p').textContent = "Le staff va traiter ta demande dès que possible.";
    
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);
  }
});