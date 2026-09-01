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
    alert(`Pronostic pour le match ${matchId}\n\nFonctionnalité bientôt disponible !`);
}

// Charger les matchs au chargement de la page
document.addEventListener('DOMContentLoaded', chargerMatchs);
