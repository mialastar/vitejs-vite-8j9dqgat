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

// --- NAVIGATION GLOBALE ---
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
      loadProfil(); 
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

// --- LOGIQUE DU PROFIL ---
async function loadProfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const username = user.user_metadata.full_name || "Joueur Inconnu";
  const avatarUrl = user.user_metadata.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";
  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-avatar').src = avatarUrl;

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  
  if (!profile) {
    const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id }).select().single();
    profile = newProfile;
  }

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

  document.getElementById('profile-rep-points').textContent = `${pts} pts`;
  document.getElementById('profile-rep-title').textContent = title;
  document.getElementById('profile-rep-fill').style.width = `${Math.min((pts / nextThreshold) * 100, 100)}%`;
  document.getElementById('profile-rep-next').textContent = `Prochain rang : ${nextThreshold} pts`;

  const banner = document.getElementById('profile-banner');
  if (profile && profile.banner_url) {
    banner.style.backgroundImage = `url('${profile.banner_url}')`;
  } else {
    banner.style.backgroundImage = `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop')`; 
  }

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

// --- INITIALISATION DU ZOOM (PANZOOM) ---
setTimeout(() => {
  const mapContent = document.getElementById('map-content');
  if (mapContent && typeof Panzoom !== 'undefined') {
    const panzoom = Panzoom(mapContent, {
      maxScale: 4, minScale: 1, startScale: 1, contain: 'outside', cursor: 'grab'
    });
    document.getElementById('map-viewport').addEventListener('wheel', panzoom.zoomWithWheel);
  }
}, 500);

// --- LOGIQUE DU SUPPORT (TICKETS DYNAMIQUES) ---
let currentTicketType = "";

document.getElementById('btn-floating-support').addEventListener('click', () => {
  document.getElementById('support-modal').classList.add('active');
  document.getElementById('support-menu-view').style.display = 'block';
  document.getElementById('support-form-view').style.display = 'none';
});

document.getElementById('btn-close-support').addEventListener('click', () => {
  document.getElementById('support-modal').classList.remove('active');
});

document.getElementById('btn-back-support').addEventListener('click', () => {
  document.getElementById('support-menu-view').style.display = 'block';
  document.getElementById('support-form-view').style.display = 'none';
});

// Injecter le bon formulaire selon le bouton cliqué
window.openSupportForm = function(type) {
  currentTicketType = type;
  document.getElementById('support-menu-view').style.display = 'none';
  document.getElementById('support-form-view').style.display = 'block';
  
  const formFields = document.getElementById('dynamic-form-fields');
  const formTitle = document.getElementById('support-form-title');
  
  let html = "";

  if (type === 'faction') {
    formTitle.textContent = "Créer une Faction (Clan / Tribu / Groupe)";
    html = `
      <div class="form-group"><label>Nom de la Faction</label><input type="text" id="t-faction-nom" required /></div>
      <div class="form-group">
        <label>Type de Faction</label>
        <select id="t-faction-type">
          <option>Clan</option><option>Tribu</option><option>Groupe de solitaires</option><option>Domestiques</option><option>Autre</option>
        </select>
      </div>
      <div class="form-group"><label>Territoire souhaité</label><input type="text" id="t-faction-territoire" placeholder="Ex: Près de la rivière au sud..." /></div>
      <div class="form-group"><label>Membres fondateurs (pseudos Discord)</label><input type="text" id="t-faction-membres" /></div>
      <div class="form-group"><label>Description / Lore</label><textarea id="t-faction-lore" placeholder="But, règles, histoire du groupe..."></textarea></div>
    `;
  } 
  else if (type === 'famille') {
    formTitle.textContent = "Créer une Famille";
    html = `
      <div class="form-group"><label>Nom de la famille</label><input type="text" id="t-famille-nom" required /></div>
      <div class="form-group"><label>Membres actuels (pseudos)</label><input type="text" id="t-famille-membres" /></div>
      <div class="form-group"><label>Lien avec un clan</label><input type="text" id="t-famille-clan" placeholder="Ex: Clan de la Forêt, ou Neutre..." /></div>
      <div class="form-group"><label>Origines / Histoire</label><textarea id="t-famille-histoire"></textarea></div>
    `;
  }
  else if (type === 'bug') {
    formTitle.textContent = "Signaler un Bug";
    html = `
      <div class="form-group"><label>Titre du problème</label><input type="text" id="t-bug-titre" required /></div>
      <div class="form-group">
        <label>Sur quel appareil ?</label>
        <select id="t-bug-appareil"><option>Mobile</option><option>PC</option><option>Tablette</option></select>
      </div>
      <div class="form-group"><label>Description détaillée</label><textarea id="t-bug-desc" placeholder="Que faisais-tu quand c'est arrivé ?"></textarea></div>
    `;
  }
  else if (type === 'suggestion') {
    formTitle.textContent = "Faire une Suggestion";
    html = `
      <div class="form-group"><label>Titre de la suggestion</label><input type="text" id="t-sugg-titre" required /></div>
      <div class="form-group">
        <label>Catégorie</label>
        <select id="t-sugg-cat"><option>Site Web</option><option>Règles du RP</option><option>Événement</option><option>Autre</option></select>
      </div>
      <div class="form-group"><label>Description de l'idée</label><textarea id="t-sugg-desc"></textarea></div>
    `;
  }
  else if (type === 'joueur') {
    formTitle.textContent = "Signaler un Joueur";
    html = `
      <div class="form-group"><label>Pseudo Discord du joueur signalé</label><input type="text" id="t-joueur-pseudo" required /></div>
      <div class="form-group">
        <label>Motif du signalement</label>
        <select id="t-joueur-motif"><option>Non-respect du Code</option><option>Harcèlement</option><option>Triche</option><option>HRP (Hors-RP)</option><option>Autre</option></select>
      </div>
      <div class="form-group"><label>Description (Que s'est-il passé ?)</label><textarea id="t-joueur-desc"></textarea></div>
    `;
  }
  else if (type === 'staff') {
    formTitle.textContent = "Rejoindre le Staff";
    html = `
      <div class="form-group"><label>Pseudo Discord</label><input type="text" id="t-staff-pseudo" required /></div>
      <div class="form-group"><label>Prénom / Âge</label><input type="text" id="t-staff-age" required /></div>
      <div class="form-group">
        <label>Poste souhaité</label>
        <select id="t-staff-poste"><option>Modérateur</option><option>Maître du Jeu (MJ)</option><option>Graphiste</option><option>Développeur</option><option>Autre</option></select>
      </div>
      <div class="form-group"><label>Motivations & Expériences</label><textarea id="t-staff-motiv"></textarea></div>
      <div class="form-group"><label>Disponibilités</label><input type="text" id="t-staff-dispo" placeholder="Ex: 2h par jour le soir" /></div>
    `;
  }

  formFields.innerHTML = html;
};

// Envoyer le ticket à Supabase (en fusionnant tous les champs)
document.getElementById('btn-submit-ticket').addEventListener('click', async () => {
  let sujet = "";
  let description = "";

  // On récupère les données selon le type de ticket
  if (currentTicketType === 'faction') {
    sujet = "Création de Faction: " + document.getElementById('t-faction-nom').value;
    description = `Type: ${document.getElementById('t-faction-type').value}\nTerritoire: ${document.getElementById('t-faction-territoire').value}\nMembres: ${document.getElementById('t-faction-membres').value}\n\nLore:\n${document.getElementById('t-faction-lore').value}`;
  } 
  else if (currentTicketType === 'famille') {
    sujet = "Création de Famille: " + document.getElementById('t-famille-nom').value;
    description = `Membres: ${document.getElementById('t-famille-membres').value}\nLien Clan: ${document.getElementById('t-famille-clan').value}\n\nOrigines:\n${document.getElementById('t-famille-histoire').value}`;
  }
  else if (currentTicketType === 'bug') {
    sujet = "Bug: " + document.getElementById('t-bug-titre').value;
    description = `Appareil: ${document.getElementById('t-bug-appareil').value}\n\nDescription:\n${document.getElementById('t-bug-desc').value}`;
  }
  else if (currentTicketType === 'suggestion') {
    sujet = "Suggestion: " + document.getElementById('t-sugg-titre').value;
    description = `Catégorie: ${document.getElementById('t-sugg-cat').value}\n\nIdée:\n${document.getElementById('t-sugg-desc').value}`;
  }
  else if (currentTicketType === 'joueur') {
    sujet = "Signalement Joueur: " + document.getElementById('t-joueur-pseudo').value;
    description = `Motif: ${document.getElementById('t-joueur-motif').value}\n\nDescription:\n${document.getElementById('t-joueur-desc').value}`;
  }
  else if (currentTicketType === 'staff') {
    sujet = "Candidature Staff: " + document.getElementById('t-staff-pseudo').value;
    description = `Prénom/Age: ${document.getElementById('t-staff-age').value}\nPoste: ${document.getElementById('t-staff-poste').value}\nDispo: ${document.getElementById('t-staff-dispo').value}\n\nMotivations:\n${document.getElementById('t-staff-motiv').value}`;
  }

  // Vérification basique
  if (!sujet || sujet.includes('undefined') || sujet.trim() === "" || sujet.endsWith(':')) {
    alert("Merci de remplir les champs obligatoires (notamment le nom/titre)."); return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Tu dois être connecté.");

  // Envoi à la base de données
  const { error } = await supabase.from('tickets').insert({
    user_id: user.id, type_ticket: currentTicketType, sujet: sujet, description: description
  });

  if (error) {
    alert("Erreur lors de l'envoi : " + error.message);
  } else {
    document.getElementById('support-modal').classList.remove('active');
    
    // Popup de succès
    const toast = document.getElementById('toast-success');
    toast.querySelector('h4').textContent = "Ticket envoyé !";
    toast.querySelector('p').textContent = "Le staff va traiter ta demande dès que possible.";
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);
  }
});

// --- LOGIQUE DES PARAMÈTRES ---
const settingsModal = document.getElementById('settings-modal');

document.getElementById('btn-open-settings').addEventListener('click', () => {
  settingsModal.classList.add('active');
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('active');
});

// --- LOGIQUE POUR RELIRE LES CRÉDITS DEPUIS LES PARAMÈTRES ---
document.getElementById('btn-open-credits').addEventListener('click', () => {
  settingsModal.classList.remove('active');
  screenApp.classList.remove('active');
  screenCredits.classList.add('active');
  
  const btnContinue = document.getElementById('btn-continue-credits');
  btnContinue.textContent = "Retour à l'application";
  
  btnContinue.onclick = () => {
    screenCredits.classList.remove('active');
    screenApp.classList.add('active');
    btnContinue.textContent = "Entrer dans les Terres du Crépuscule";
    btnContinue.onclick = null; 
    window.location.reload(); // Recharge pour réinitialiser le bouton
  };
});

// --- LOGIQUE DES RELATIONS ---
let currentRelationFicheId = null; // Sert à savoir de quelle fiche on part

// Quand on clique sur le bouton "Demander" dans l'onglet Relations
document.getElementById('btn-request-relation').addEventListener('click', async () => {
  // currentRelationFicheId est récupéré dans la fonction openFicheDetail
  if(!currentRelationFicheId) return;

  document.getElementById('relation-modal').classList.add('active');
  document.getElementById('rel-message').value = '';

  const selectCible = document.getElementById('rel-cible');
  selectCible.innerHTML = '<option value="">Chargement...</option>';

  // On va chercher toutes les fiches validées SAUF la fiche actuelle
  const { data: fiches } = await supabase.from('fiches_oc').select('id, nom').eq('statut', 'Validée').neq('id', currentRelationFicheId);
  
  selectCible.innerHTML = '<option value="">Choisir un personnage...</option>';
  if (fiches && fiches.length > 0) {
    fiches.forEach(f => {
      selectCible.innerHTML += `<option value="${f.id}">${f.nom}</option>`;
    });
  } else {
    selectCible.innerHTML = '<option value="">Aucun autre personnage disponible</option>';
  }
});

// Fermer la modale
document.getElementById('btn-close-relation').addEventListener('click', () => {
  document.getElementById('relation-modal').classList.remove('active');
});

// Envoyer la demande (crée un ticket)
document.getElementById('btn-submit-relation').addEventListener('click', async () => {
  const type = document.getElementById('rel-type').value;
  const cibleId = document.getElementById('rel-cible').value;
  const message = document.getElementById('rel-message').value;

  if (!cibleId || !message) {
    alert("Merci de choisir un personnage et d'écrire un petit message.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  // On récupère les noms pour faire un joli ticket
  const { data: ficheSource } = await supabase.from('fiches_oc').select('nom').eq('id', currentRelationFicheId).single();
  const { data: ficheCible } = await supabase.from('fiches_oc').select('nom').eq('id', cibleId).single();

  const sujet = `Relation: ${ficheSource.nom} & ${ficheCible.nom}`;
  const description = `Type de lien : ${type}\n\nMessage : ${message}`;

  // On crée le ticket pour le staff
  const { error } = await supabase.from('tickets').insert({
    user_id: user.id, 
    type_ticket: 'relation', 
    sujet: sujet, 
    description: description
  });

  if (error) {
    alert("Erreur lors de l'envoi : " + error.message);
  } else {
    document.getElementById('relation-modal').classList.remove('active');
    
    const toast = document.getElementById('toast-success');
    toast.querySelector('h4').textContent = "Demande envoyée !";
    toast.querySelector('p').textContent = "Le staff va contacter l'autre joueur pour valider cette relation.";
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 500); }, 5000);
  }
});