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