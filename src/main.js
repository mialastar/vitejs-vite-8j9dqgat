import './style.css';
import { createClient } from '@supabase/supabase-js';

// ⚠️ TES CLÉS SUPABASE
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
  setTimeout(() => {
    next.classList.add('active');
  }, 800); 
}

btnStart.addEventListener('click', () => switchScreen(screenIntro, screenCredits));
btnContinueCredits.addEventListener('click', () => switchScreen(screenCredits, screenAuth));

// --- CONNEXION DISCORD ---
btnDiscordLogin.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'https://lgdc-rp.vercel.app' 
    }
  });
  if (error) alert("Erreur de connexion.");
});

// --- VÉRIFICATION UTILISATEUR AU CHARGEMENT ---
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

// --- LOGIQUE DE NAVIGATION DES ONGLETS ---
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

// --- LOGIQUE DES SOUS-ONGLETS FICHES ---
const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const subviews = document.querySelectorAll('.subview');

subTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    subTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    subviews.forEach(v => v.classList.remove('active'));
    const subTarget = e.currentTarget.getAttribute('data-sub');
    document.getElementById(`subview-${subTarget}`).classList.add('active');
  });
});

// --- LOGIQUE DU WIZARD ---
let currentStep = 1;
const totalSteps = 9;
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressFill = document.getElementById('progress-bar-fill');
const stepNumText = document.getElementById('current-step-num');

function updateWizard() {
  document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
  document.getElementById(`step-${currentStep}`).classList.add('active');
  
  stepNumText.textContent = currentStep;
  progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;

  btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  if (currentStep === totalSteps) {
    btnNext.textContent = 'Soumettre la fiche';
    btnNext.style.background = '#10b981';
    btnNext.style.color = '#fff';
  } else {
    btnNext.textContent = 'Suivant';
    btnNext.style.background = '';
    btnNext.style.color = '';
  }
}

btnPrev.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    updateWizard();
  }
});

// --- SOUMISSION DU FORMULAIRE ---
btnNext.addEventListener('click', async () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizard();
  } else {
    // Récupération des données
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
    const competences_details = document.querySelector('#step-5 textarea').value;
    const objectifs_court = document.querySelectorAll('#step-6 input')[0].value;
    const objectifs_long = document.querySelectorAll('#step-6 input')[1].value;
    const reves = document.querySelector('#step-6 textarea').value;
    const peurs = document.querySelector('#step-7 input').value;
    const vulnerabilites = document.querySelector('#step-7 textarea').value;

    const stats_force = document.getElementById('stat-force').value;
    const stats_agilite = document.getElementById('stat-agilite').value;
    const stats_endurance = document.getElementById('stat-endurance').value;
    const stats_ruse = document.getElementById('stat-ruse').value;
    const stats_charisme = document.getElementById('stat-charisme').value;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Erreur : Tu dois être connecté pour créer une fiche.");
      return;
    }

    // Envoi à Supabase
    const { error } = await supabase.from('fiches_oc').insert({
      user_id: user.id,
      nom: nom,
      clan: clan,
      rang: rang,
      pelage: pelage,
      yeux: yeux,
      traits: traits,
      qualites: qualites,
      defauts: defauts,
      origines: origines,
      evenements: evenements,
      competences_details: competences_details,
      objectifs_court: objectifs_court,
      objectifs_long: objectifs_long,
      reves: reves,
      peurs: peurs,
      vulnerabilites: vulnerabilites,
      stats_force: parseInt(stats_force),
      stats_agilite: parseInt(stats_agilite),
      stats_endurance: parseInt(stats_endurance),
      stats_ruse: parseInt(stats_ruse),
      stats_charisme: parseInt(stats_charisme),
      statut: 'En attente'
    });

    if (error) {
      console.error(error);
      alert("Erreur : " + error.message);
    } else {
      // Affichage du popup
      const toast = document.getElementById('toast-success');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('show'), 50);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 500);
      }, 5000);

      // Reset du formulaire
      document.querySelectorAll('.wizard-form input, .wizard-form textarea').forEach(el => el.value = '');
      document.querySelectorAll('.wizard-form select').forEach(el => el.selectedIndex = 0);
      
      currentStep = 1;
      updateWizard();
      document.querySelector('[data-sub="mine"]').click();
      document.querySelector('[data-sub="mine"]').click();
      loadMyFiches(); // <--- AJOUTE CETTE LIGNE ICI
    }
  }
});

// --- LOGIQUE DES STATS ---
const sliders = document.querySelectorAll('.stat-slider');
const pointsLeftDisplay = document.getElementById('points-left');
const maxPoints = 20;

function updateStats() {
  let totalUsed = 0;
  sliders.forEach(slider => {
    totalUsed += parseInt(slider.value);
    document.getElementById(`val-${slider.id.split('-')[1]}`).textContent = slider.value;
  });

  let remaining = maxPoints - totalUsed;
  pointsLeftDisplay.textContent = remaining;
  pointsLeftDisplay.style.color = remaining < 0 ? '#ef4444' : 'var(--accent)';
}

sliders.forEach(slider => {
  slider.addEventListener('input', () => {
    let totalUsed = 0;
    sliders.forEach(s => totalUsed += parseInt(s.value));
    if (totalUsed > maxPoints) slider.value = parseInt(slider.value) - 1;
    updateStats();
  });
});
updateStats();

// --- AFFICHER LES FICHES DU JOUEUR ---
async function loadMyFiches() {
  const container = document.getElementById('my-fiches-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';

  // On récupère l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // On demande à Supabase toutes les fiches de cet utilisateur
  const { data: fiches, error } = await supabase
    .from('fiches_oc')
    .select('*')
    .eq('user_id', user.id)
    .order('date_creation', { ascending: false });

  if (error) {
    container.innerHTML = `<p style="color: red;">Erreur : ${error.message}</p>`;
    return;
  }

  // Si le joueur n'a pas de fiche
  if (fiches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray; margin-top: 20px;">Tu n\'as pas encore de fiche.</p>';
    return;
  }

  // Sinon, on génère les cartes HTML
  container.innerHTML = ''; // On vide le conteneur
  fiches.forEach(fiche => {
    let statusClass = 'status-attente';
    if (fiche.statut === 'Validée') statusClass = 'status-valide';
    if (fiche.statut === 'Refusée') statusClass = 'status-refuse';

    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.innerHTML = `
      <div class="fiche-card-header">
        <h4>${fiche.nom || 'Sans nom'}</h4>
        <span class="status-badge ${statusClass}">${fiche.statut}</span>
      </div>
      <div class="fiche-card-info">
        <p><strong>Clan :</strong> ${fiche.clan}</p>
        <p><strong>Rang :</strong> ${fiche.rang}</p>
      </div>
      <div class="fiche-card-actions">
        <button class="btn-action btn-modifier" onclick="alert('Bientôt disponible !')">Modifier</button>
        <button class="btn-action btn-supprimer" onclick="alert('Bientôt disponible !')">Supprimer</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Quand on clique sur l'onglet "Mes fiches", on charge les données
document.querySelector('[data-sub="mine"]').addEventListener('click', loadMyFiches);

// Et on charge aussi les fiches juste après avoir soumis une nouvelle fiche
// (Cherche la ligne "document.querySelector('[data-sub="mine"]').click();" à la fin de ton btnNext et ajoute "loadMyFiches();" juste après)

// --- AFFICHER TOUTES LES FICHES (PUBLIC) ---
let allValidatedFiches = []; // On stocke les fiches ici pour la recherche

async function loadAllFiches() {
  const container = document.getElementById('all-fiches-container');
  container.innerHTML = '<p style="text-align: center; color: gray;">Chargement...</p>';

  // On récupère UNIQUEMENT les fiches validées
  const { data: fiches, error } = await supabase
    .from('fiches_oc')
    .select('*')
    .eq('statut', 'Validée') // Filtre important !
    .order('date_creation', { ascending: false });

  if (error) {
    container.innerHTML = `<p style="color: red;">Erreur : ${error.message}</p>`;
    return;
  }

  allValidatedFiches = fiches; // On sauvegarde pour la recherche
  renderPublicFiches(fiches);
}

function renderPublicFiches(fiches) {
  const container = document.getElementById('all-fiches-container');
  
  if (fiches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: gray; margin-top: 20px;">Aucune fiche trouvée.</p>';
    return;
  }

  container.innerHTML = '';
  fiches.forEach(fiche => {
    const card = document.createElement('div');
    card.className = 'public-fiche-card';
    
    // On vérifie si une image existe. Si oui, on crée la div, sinon on ne met rien.
    let imageHtml = '';
    if (fiche.image_url && fiche.image_url.trim() !== '') {
      imageHtml = `<div class="card-image" style="background-image: url('${fiche.image_url}')"></div>`;
    }

    // On prend les 100 premiers caractères de l'histoire pour le résumé
    const bioCourte = fiche.origines ? fiche.origines.substring(0, 100) + '...' : 'Pas d\'histoire renseignée.';

    card.innerHTML = `
      ${imageHtml}
      <div class="card-content">
        <h3>${fiche.nom}</h3>
        <div class="card-tags">
          <span class="tag">${fiche.clan}</span>
          <span class="tag">${fiche.rang}</span>
        </div>
        <p class="card-bio">${bioCourte}</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      openFicheDetail(fiche);
    });

    container.appendChild(card);
  });
}

// --- RECHERCHE PAR NOM ---
document.getElementById('search-fiches').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allValidatedFiches.filter(f => 
    f.nom.toLowerCase().includes(searchTerm)
  );
  renderPublicFiches(filtered);
});

// Quand on clique sur l'onglet "Voir les fiches", on charge les données
document.querySelector('[data-sub="all"]').addEventListener('click', loadAllFiches);

// --- OUVRIR LA PAGE DE DÉTAIL ---
function openFicheDetail(fiche) {
  // 1. Cacher la vue des fiches et afficher la page de détail
  document.getElementById('view-fiches').classList.remove('active');
  document.getElementById('view-fiche-detail').classList.add('active');
  window.scrollTo(0, 0); // Remonter en haut

  // 2. Remplir les textes
  document.getElementById('detail-nom').textContent = fiche.nom;
  document.getElementById('detail-clan').textContent = fiche.clan;
  document.getElementById('detail-rang').textContent = fiche.rang;
  
  document.getElementById('detail-origines').textContent = fiche.origines || 'Non renseigné.';
  document.getElementById('detail-traits').textContent = fiche.traits || 'Non renseigné.';
  document.getElementById('detail-qualites').textContent = fiche.qualites || 'Non renseigné.';
  document.getElementById('detail-defauts').textContent = fiche.defauts || 'Non renseigné.';
  
  document.getElementById('detail-pelage').textContent = fiche.pelage || 'Non renseigné.';
  document.getElementById('detail-yeux').textContent = fiche.yeux || 'Non renseigné.';

  // 3. Gérer l'image (affichage conditionnel)
  const imgContainer = document.getElementById('detail-image');
  if (fiche.image_url && fiche.image_url.trim() !== '') {
    imgContainer.style.backgroundImage = `url('${fiche.image_url}')`;
    imgContainer.style.display = 'block';
  } else {
    imgContainer.style.display = 'none';
  }

  // 4. Remplir les Stats
  const stats = [
    { id: 'force', val: fiche.stats_force },
    { id: 'agilite', val: fiche.stats_agilite },
    { id: 'endurance', val: fiche.stats_endurance },
    { id: 'ruse', val: fiche.stats_ruse },
    { id: 'charisme', val: fiche.stats_charisme }
  ];

  stats.forEach(stat => {
    const val = stat.val || 0;
    document.getElementById(`num-${stat.id}`).textContent = val;
    // On calcule la largeur de la barre (max 10)
    document.getElementById(`bar-${stat.id}`).style.width = `${(val / 10) * 100}%`;
  });
}

// --- GÉRER LES ONGLETS INTERNES DE LA FICHE ---
const detailTabBtns = document.querySelectorAll('.detail-tab-btn');
const dtabs = document.querySelectorAll('.dtab');

detailTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    detailTabBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    dtabs.forEach(t => t.classList.remove('active'));
    const target = e.currentTarget.getAttribute('data-dtab');
    document.getElementById(`dtab-${target}`).classList.add('active');
  });
});

// --- BOUTON RETOUR ---
document.getElementById('btn-back-fiches').addEventListener('click', () => {
  document.getElementById('view-fiche-detail').classList.remove('active');
  document.getElementById('view-fiches').classList.add('active');
  
  // Remettre l'onglet "Voir les fiches" actif quand on revient
  document.querySelector('[data-sub="all"]').classList.add('active');
  document.getElementById('subview-all').classList.add('active');
});