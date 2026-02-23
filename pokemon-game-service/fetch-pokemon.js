const fetch = require('node-fetch');
const db = require('./db');

async function populatePokemons() {
    try {
        console.log('Fetching Pokémon list from API...');
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await res.json();

        const pokemonList = data.results;

        console.log(`Saving ${pokemonList.length} Pokémon to database...`);

        const insertStmt = db.prepare(
            `INSERT OR IGNORE INTO pokemon (name) VALUES (?)`
        );

        pokemonList.forEach(p => {
            insertStmt.run(p.name);
        });

        insertStmt.finalize(() => {
            console.log('Pokémon saved successfully!');
        });
        
        return pokemonList;
    } catch (err) {
        console.error('Error fetching Pokémon:', err);
    }
}

function maskPokemonName(name) {
  if (!name || name.length === 0) return '';
  
  // Pick a random letter to hide
  const index = Math.floor(Math.random() * name.length);
  const masked = name.split('').map((c, i) => i === index ? '_' : c).join('');
  
  return { masked, index };
}

// Export the functions as an object
module.exports = {
    populatePokemons,
    maskPokemonName
};