// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBQtPai6rjPEEri1N6xUiLtk4bJ48eEVRo",
  authDomain: "juju-bet.firebaseapp.com",
  projectId: "juju-bet",
  storageBucket: "juju-bet.firebasestorage.app",
  messagingSenderId: "495694065283",
  appId: "1:495694065283:web:4434e86e606f53139cb5b6",
  measurementId: "G-DXJ9Y8TB3S"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Références
const auth = firebase.auth();
const db = firebase.firestore();

// Fonction d'inscription
async function inscription(email, password) {
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Fonction de connexion
async function connexion(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Fonction de déconnexion
async function deconnexion() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Observer l'état de l'utilisateur
auth.onAuthStateChanged(user => {
    const nav = document.querySelector('.nav');
    if (user) {
        if (!document.getElementById('userInfo')) {
            const userDiv = document.createElement('div');
            userDiv.id = 'userInfo';
            userDiv.innerHTML = `
                <span style="color:white;font-size:0.8rem;">${user.email}</span>
                <button onclick="deconnexion()" class="nav-btn">Déconnexion</button>
            `;
            nav.appendChild(userDiv);
        }
    } else {
        const existing = document.getElementById('userInfo');
        if (existing) existing.remove();
        if (!document.getElementById('authBtns')) {
            const authDiv = document.createElement('div');
            authDiv.id = 'authBtns';
            authDiv.innerHTML = `
                <button onclick="afficherConnexion()" class="nav-btn">Connexion</button>
                <button onclick="afficherInscription()" class="nav-btn">Inscription</button>
            `;
            nav.appendChild(authDiv);
        }
    }
});

// Fonctions pour afficher les formulaires simples
function afficherConnexion() {
    const email = prompt("Email :");
    const password = prompt("Mot de passe :");
    if (email && password) {
        connexion(email, password).then(res => {
            if (!res.success) alert("Erreur : " + res.message);
        });
    }
}

function afficherInscription() {
    const email = prompt("Email :");
    const password = prompt("Mot de passe (6 caractères min) :");
    if (email && password) {
        inscription(email, password).then(res => {
            if (!res.success) alert("Erreur : " + res.message);
        });
    }
}

// ========== Sauvegarder un pronostic ==========
async function sauvegarderPronostic(matchId, type, prediction) {
    const user = auth.currentUser;
    if (!user) {
        alert("Vous devez être connecté pour faire un pronostic.");
        return { success: false, message: "Non connecté" };
    }

    try {
        await db.collection("pronostics").add({
            userId: user.uid,
            email: user.email,
            matchId: matchId,
            type: type,
            prediction: prediction,
            date: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Erreur sauvegarde pronostic:", error);
        return { success: false, message: error.message };
    }
}
