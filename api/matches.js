// api/matches.js
const fetch = require('node-fetch');

// Liste des compétitions (IDs football-data.org)
const COMPETITIONS = {
    'PL': 'Premier League',
    'PD': 'La Liga',
    'FL1': 'Ligue 1',
    'BL1': 'Bundesliga',
    'SA': 'Serie A',
    'CL': 'Champions League',
    'EL': 'Europa League'
};

// Cache simple en mémoire (durée de vie 5 minutes)
let cache = {
    data: null,
    timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res) => {
    // Autoriser les requêtes depuis ton site (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Vérifier si le cache est valide
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
        return res.status(200).json(cache.data);
    }

    try {
        const apiKey = process.env.FOOTBALL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Récupérer les matchs du jour pour chaque compétition
        const allMatches = [];
        const dateFrom = new Date().toISOString().split('T')[0];
        const dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 jours

        for (const [code, name] of Object.entries(COMPETITIONS)) {
            const response = await fetch(
                `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
                {
                    headers: { 'X-Auth-Token': apiKey }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.matches) {
                    data.matches.forEach(match => {
                        allMatches.push({
                            id: match.id,
                            competition: name,
                            homeTeam: match.homeTeam.shortName || match.homeTeam.name,
                            awayTeam: match.awayTeam.shortName || match.awayTeam.name,
                            homeScore: match.score.fullTime.home ?? null,
                            awayScore: match.score.fullTime.away ?? null,
                            status: match.status, // SCHEDULED, LIVE, FINISHED
                            utcDate: match.utcDate
                        });
                    });
                }
            }
            // Petite pause pour respecter la limite de l'API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Trier par date
        allMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

        // Mettre en cache
        cache = {
            data: { matches: allMatches },
            timestamp: now
        };

        res.status(200).json({ matches: allMatches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};
