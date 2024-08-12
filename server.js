const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to normalize location
function normalizeLocation(location) {
    return location.replace(/\s*\(.*?\)/, '').trim();
}

// Endpoint to serve locations.json
app.get('/locations.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'locations.json'));
});

// Endpoint to serve Pokémon data based on region and location
app.get('/pokemons_data', (req, res) => {
    const region = req.query.region;
    const location = req.query.location;

    if (!region || !location) {
        return res.status(400).json({ error: 'Region and location are required' });
    }

    console.log(`Fetching Pokémon data for Region: ${region}, Location: ${location}`);

    const pokemonsDir = path.join(__dirname, 'pokemons');
    let encounters = [];

    try {
        fs.readdirSync(pokemonsDir).forEach(filename => {
            if (filename.endsWith(".json")) {
                const pokemonData = JSON.parse(fs.readFileSync(path.join(pokemonsDir, filename), 'utf-8'));

                pokemonData.locations.forEach(loc => {
                    if (loc.region_name === region && normalizeLocation(loc.location) === normalizeLocation(location)) {
                        encounters.push({
                            name: pokemonData.name,
                            id: pokemonData.id,
                            type: loc.type,
                            rarity: loc.rarity,
                            minLevel: loc.min_level,
                            maxLevel: loc.max_level,
                            heldItems: pokemonData.held_items.map(item => item.name).join(', '),
                            dayTimeSeason: loc.location.includes('(') ? loc.location.split('(')[1].replace(')', '') : ''
                        });
                    }
                });
            }
        });

        if (encounters.length === 0) {
            return res.status(404).json({ error: 'No Pokémon found at the selected location.' });
        }

        res.json(encounters);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
