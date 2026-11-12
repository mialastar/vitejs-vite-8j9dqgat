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