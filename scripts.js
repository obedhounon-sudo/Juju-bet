// Fonction pour charger les matchs depuis notre API
async function chargerMatchs() {
    try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
            afficherMatchs(data.matches);
        } else {
            document.getElementById('matchesGrid').innerHTML = '<p>Aucun match trouvé.</p>';
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
        document.getElementById('matchesGrid').innerHTML = '<p>Erreur de chargement des matchs.</p>';
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

function fairePronostic(matchId) {
    // Vérifier si l'utilisateur est connecté
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

        // Appeler la fonction de sauvegarde définie dans firebase.js
        sauvegarderPronostic(matchId, "score_final", prediction).then(res => {
            if (res.success) {
                alert("Pronostic enregistré !");
            } else {
                alert("Erreur : " + res.message);
            }
        });
    }
}

// Charger les matchs au chargement de la page
document.addEventListener('DOMContentLoaded', chargerMatchs);
