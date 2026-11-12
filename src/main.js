import './style.css';
import { createClient } from '@supabase/supabase-js';

// 👇 VÉRIFIE BIEN TES CLÉS ICI 👇
const SUPABASE_URL = 'https://lrkiivqbnkkduxfcrbjn.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_q7sNSUeAKIGxpDUp30yeIQ_0_qV6BY0';

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