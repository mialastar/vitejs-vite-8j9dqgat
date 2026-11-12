import './style.css';
import { createClient } from '@supabase/supabase-js';

// 👇 VÉRIFIE BIEN TES CLÉS ICI 👇
const SUPABASE_URL = 'https://lrkiivqbnkkduxfcrbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2lpdnFibmtrZHV4ZmNyYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTI0MTMsImV4cCI6MjExMDA4ODQxM30.jpDPREZttmd__dVy2Uy3DdmjRUPQtdd_nUoJWAyOO6Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GESTION DES ÉCRANS ---
const screenIntro = document.getElementById('screen-intro');
const screenCredits = document.getElementById('screen-credits');
const screenAuth = document.getElementById('screen-auth');

const btnStart = document.getElementById('btn-start');
const btnContinueCredits = document.getElementById('btn-continue-credits');
const btnDiscordLogin = document.getElementById('btn-discord-login');

function switchScreen(current, next) {
  current.classList.remove('active');
  setTimeout(() => {
    next.classList.add('active');
  }, 800);
}

// Intro -> Crédits
btnStart.addEventListener('click', () => {
  switchScreen(screenIntro, screenCredits);
});

// Crédits -> Auth
btnContinueCredits.addEventListener('click', () => {
  switchScreen(screenCredits, screenAuth);
});

// --- LOGIQUE DE CONNEXION DISCORD ---
btnDiscordLogin.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Erreur de connexion :', error.message);
    alert('Erreur lors de la connexion à Discord.');
  }
});

// --- VÉRIFICATION DE L'UTILISATEUR AU CHARGEMENT ---
async function checkUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    console.log('Connecté en tant que :', session.user.user_metadata.full_name);
    alert(
      `Bienvenue sur les Terres du Crépuscule, ${session.user.user_metadata.full_name} !`
    );
  }
}

checkUser();