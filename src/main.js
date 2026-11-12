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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'https://lgdc-rp.vercel.app' // Ton lien Vercel
    }
  });
  if (error) alert("Erreur de connexion : " + error.message);
});

// --- VÉRIFICATION UTILISATEUR AU CHARGEMENT ---
async function checkUser() {
  const { data } = await supabase.auth.getSession();
  
  if (data && data.session) {
    // Si connecté, on affiche DIRECTEMENT l'application
    screenIntro.classList.remove('active');
    screenCredits.classList.remove('active');
    screenAuth.classList.remove('active');
    screenApp.classList.add('active');
    console.log("Connecté en tant que :", data.session.user.user_metadata.full_name);
  }
}
checkUser();

// --- GESTION DE LA NAVIGATION ---
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navButtons.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

// --- LOGIQUE DE NAVIGATION DES ONGLETS ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Gérer la classe active du menu bas
    navBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Cacher toutes les vues
    views.forEach(v => v.classList.remove('active'));

    // Afficher la bonne vue selon le data-target
    const target = e.currentTarget.getAttribute('data-target');
    
    if(target === 'accueil') {
      document.getElementById('view-accueil').classList.add('active');
    } else if (target === 'fiches') {
      document.getElementById('view-fiches').classList.add('active');
    }
    // Les autres onglets seront ajoutés plus tard
  });
});

// --- LOGIQUE DES 3 SOUS-ONGLETS FICHES ---
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

// --- LOGIQUE DU WIZARD (FORMULAIRE) ---
let currentStep = 1;
const totalSteps = 9;
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressFill = document.getElementById('progress-bar-fill');
const stepNumText = document.getElementById('current-step-num');

function updateWizard() {
  // Cacher toutes les étapes
  document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
  // Afficher l'étape actuelle
  document.getElementById(`step-${currentStep}`).classList.add('active');
  
  // Mettre à jour la barre
  stepNumText.textContent = currentStep;
  const percent = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${percent}%`;

  // Gérer l'affichage des boutons
  btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  
  if (currentStep === totalSteps) {
    btnNext.textContent = 'Soumettre la fiche';
    btnNext.style.background = '#10b981'; // Vert pour la fin
    btnNext.style.color = '#fff';
  } else {
    btnNext.textContent = 'Suivant';
    btnNext.style.background = ''; // Remet la couleur par défaut
    btnNext.style.color = '';
  }
}

btnNext.addEventListener('click', () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizard();
  } else {
    // C'est ici qu'on enregistrera dans Supabase plus tard !
    // --- LOGIQUE DU BOUTON SUIVANT ---
btnNext.addEventListener('click', () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizard();
  } else {
    // C'est ici qu'on enregistrera dans Supabase plus tard !
    
    // On affiche le popup stylé
    const toast = document.getElementById('toast-success');
    toast.classList.remove('hidden');
    // Petit délai pour l'animation CSS
    setTimeout(() => toast.classList.add('show'), 50);
    
    // On cache le popup après 5 secondes
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 500);
    }, 5000);

    // Optionnel : Remettre le formulaire à zéro et revenir à l'étape 1
    currentStep = 1;
    updateWizard();
    
    // Et basculer sur l'onglet "Mes fiches"
    document.querySelector('[data-sub="mine"]').click();
  }
});
  }
});

btnPrev.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    updateWizard();
  }
});

// --- LOGIQUE DES STATS (MAX 20 POINTS) ---
const sliders = document.querySelectorAll('.stat-slider');
const pointsLeftDisplay = document.getElementById('points-left');
let maxPoints = 20;

function updateStats() {
  let totalUsed = 0;
  
  sliders.forEach(slider => {
    totalUsed += parseInt(slider.value);
    // Mettre à jour le chiffre à côté du nom de la stat
    document.getElementById(`val-${slider.id.split('-')[1]}`).textContent = slider.value;
  });

  let remaining = maxPoints - totalUsed;
  pointsLeftDisplay.textContent = remaining;

  if (remaining < 0) {
    pointsLeftDisplay.style.color = '#ef4444'; // Rouge si dépassement
  } else {
    pointsLeftDisplay.style.color = 'var(--accent)'; // Jaune/Or normal
  }
}

// Écouter les changements sur chaque curseur
sliders.forEach(slider => {
  slider.addEventListener('input', () => {
    let totalUsed = 0;
    sliders.forEach(s => totalUsed += parseInt(s.value));
    
    // Si le joueur essaie de dépasser 20 points, on bloque le curseur
    if (totalUsed > maxPoints) {
      slider.value = parseInt(slider.value) - 1;
    }
    updateStats();
  });
});

// Initialiser au chargement
updateStats();