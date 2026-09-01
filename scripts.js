// ============ DONNÉES DE TEST ============
const matchsTest = [
    {
        id: 1,
        championnat: "Ligue 1",
        equipeDomicile: "PSG",
        equipeExterieur: "Marseille",
        scoreDomicile: null,
        scoreExterieur: null,
        date: "Aujourd'hui 20:45",
        statut: "a_venir"
    },
    {
        id: 2,
        championnat: "Premier League",
        equipeDomicile: "Arsenal",
        equipeExterieur: "Chelsea",
        scoreDomicile: null,
        scoreExterieur: null,
        date: "Aujourd'hui 18:30",
        statut: "a_venir"
    },
    {
        id: 3,
        championnat: "Liga",
        equipeDomicile: "Real Madrid",
        equipeExterieur: "Barcelone",
        scoreDomicile: 2,
        scoreExterieur: 1,
        date: "En direct 67'",
        statut: "en_cours"
    },
    {
        id: 4,
        championnat: "Serie A",
        equipeDomicile: "Juventus",
        equipeExterieur: "Inter Milan",
        scoreDomicile: 1,
        scoreExterieur: 1,
        date: "Terminé",
        statut: "termine"
    }
];

// ============ FONCTIONS ============
function afficherMatchs() {
    const matchesGrid = document.getElementById('matchesGrid');
    
    matchesGrid.innerHTML = matchsTest.map(match => {
        const score = match.statut === 'a_venir' 
            ? 'VS' 
            : `${match.scoreDomicile} - ${match.scoreExterieur}`;
        
        const statutClass = match.statut === 'en_cours' ? 'live' : '';
        
        return `
            <div class="match-card ${statutClass}">
                <div class="match-league">${match.championnat}</div>
                <div class="match-teams">
                    <div class="team">${match.equipeDomicile}</div>
                    <div class="team-score">${score}</div>
                    <div class="team">${match.equipeExterieur}</div>
                </div>
                <div class="match-time">${match.date}</div>
                ${match.statut !== 'termine' ? 
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
    const match = matchsTest.find(m => m.id === matchId);
    
    if (match) {
        alert(`Pronostic pour ${match.equipeDomicile} vs ${match.equipeExterieur}\n\nFonctionnalité à venir !`);
    }
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    afficherMatchs();
    console.log('Juju Bet est prêt !');
});
