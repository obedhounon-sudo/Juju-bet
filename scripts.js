// ============ NAVIGATION ============
function afficherPage(pageId) {
    // Masquer toutes les sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
    });
    // Afficher la section demandée
    const page = document.getElementById('page-' + pageId);
    if (page) page.style.display = 'block';

    // Mettre à jour les boutons actifs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Trouver le bouton cliqué via son texte ? Mieux : on ajoute un data-page
    // Pour simplifier, on va juste mettre actif sur le bouton qui contient le texte correspondant
    // Mais plus simple : on utilise un paramètre dans onclick (voir plus bas)
}

// Fonction pour gérer le clic et l'activation du bouton
function afficherPageAvecBouton(pageId, bouton) {
    afficherPage(pageId);
    // Enlever active de tous
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    // Ajouter active au bouton cliqué
    bouton.classList.add('active');
}

// ============ CHARGEMENT DES MATCHS ============
async function chargerMatchs() {
    try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        if (data.error) {
            document.getElementById('matchesGrid').innerHTML = `<p>Erreur API : ${data.error}</p>`;
        } else if (data.matches && data.matches.length > 0) {
            afficherMatchs(data.matches);
        } else {
            document.getElementById('matchesGrid').innerHTML = '<p>Aucun match trouvé.</p>';
        }
    } catch (error) {
        document.getElementById('matchesGrid').innerHTML = `<p>Erreur : ${error.message}</p>`;
    }
}

function afficherMatchs(matchs) {
    const matchesGrid = document.getElementById('matchesGrid');
    
    matchesGrid.innerHTML = matchs.map(match => {
        const score = match.status === 'SCHEDULED' 
            ? 'VS' 
            : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;
        
        const statutText = match.status === 'LIVE' ? 'En direct' : 
                           match.status === 'FINISHED' ? 'Terminé' : 
                           new Date(match.utcDate).toLocaleString('fr-FR', { 
                               day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                           });
        
        const statutClass = match.status === 'LIVE' ? 'live' : '';
        
        return `
            <div class="match-card ${statutClass}">
                <div class="match-league">${match.competition}</div>
                <div class="match-teams">
                    <div class="team">${match.homeTeam}</div>
                    <div class="team-score">${score}</div>
                    <div class="team">${match.awayTeam}</div>
                </div>
                <div class="match-time">${statutText}</div>
                ${match.status === 'SCHEDULED' ? 
                    `<button class="pronostic-btn" onclick="fairePronostic(${match.id})">
                        Faire un pronostic
                    </button>` : 
                    ''
                }
            </div>
        `;
    }).join('');
}

// ============ PRONOSTIC ============
function fairePronostic(matchId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Vous devez être connecté pour faire un pronostic.");
        return;
    }

    // Demander le score final (simple pour l'instant)
    const scoreHome = prompt("Score de l'équipe à domicile :");
    const scoreAway = prompt("Score de l'équipe à l'extérieur :");

    if (scoreHome !== null && scoreAway !== null && !isNaN(scoreHome) && !isNaN(scoreAway)) {
        const prediction = {
            home: parseInt(scoreHome),
            away: parseInt(scoreAway)
        };

        sauvegarderPronostic(matchId, "score_final", prediction).then(res => {
            if (res.success) {
                alert("Pronostic enregistré !");
            } else {
                alert("Erreur : " + res.message);
            }
        });
    }
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Charger les matchs au démarrage
    chargerMatchs();
});
