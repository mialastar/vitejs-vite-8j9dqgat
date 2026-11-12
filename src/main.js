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

    // Afficher la bonne vue
    const target = e.currentTarget.getAttribute('data-target');
    if(target === 'accueil') document.getElementById('view-accueil').classList.add('active');
    if(target === 'fiches') document.getElementById('view-fiches').classList.add('active');
    // (Les autres vues s'ajouteront plus tard)
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
    alert("Formulaire terminé ! (L'enregistrement Supabase viendra ensuite)");
  }
});

btnPrev.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    updateWizard();
  }
});