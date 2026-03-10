const Fastify = require('fastify');
const cors = require('@fastify/cors');

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: '*'
});

// In-Memory cache for characters
const cache = {
  lol: [],
  valorant: [],
  overwatch: []
};

// Fetch League of Legends Champions
async function fetchLolChampions() {
  try {
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionRes.json();
    const latestVersion = versions[0];
    const champsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const champsData = await champsRes.json();
    
    // Convert object to array and extract useful details
    cache.lol = Object.values(champsData.data).map(champ => ({
      id: champ.id,
      name: champ.name,
      title: champ.title,
      // The Data Dragon JSON has champ.image.full
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`
    }));
    fastify.log.info(`Loaded ${cache.lol.length} LoL champions.`);
  } catch (err) {
    fastify.log.error('Failed to load LoL champions:', err);
  }
}

// Fetch Valorant Agents
async function fetchValorantAgents() {
  try {
    const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const data = await res.json();
    
    cache.valorant = data.data.map(agent => ({
      id: agent.uuid,
      name: agent.displayName,
      role: agent.role ? agent.role.displayName : 'Unknown',
      image: agent.displayIcon
    }));
    fastify.log.info(`Loaded ${cache.valorant.length} Valorant agents.`);
  } catch (err) {
    fastify.log.error('Failed to load Valorant agents:', err);
  }
}

// Fetch Overwatch Heroes
async function fetchOverwatchHeroes() {
  try {
    const res = await fetch('https://overfast-api.tekrop.fr/heroes');
    const data = await res.json();
    
    cache.overwatch = data.map(hero => ({
      id: hero.key,
      name: hero.name,
      role: hero.role,
      image: hero.portrait
    }));
    fastify.log.info(`Loaded ${cache.overwatch.length} Overwatch heroes.`);
  } catch (err) {
    fastify.log.error('Failed to load Overwatch heroes:', err);
  }
}

fastify.get('/api/randomizer/:game', async (request, reply) => {
  const game = request.params.game.toLowerCase();
  
  if (!cache[game] || cache[game].length === 0) {
    return reply.status(404).send({ error: 'Game not found or data not loaded yet. Valid games: lol, valorant, overwatch' });
  }

  const characters = cache[game];
  const randomIndex = Math.floor(Math.random() * characters.length);
  const randomCharacter = characters[randomIndex];

  return {
    game: game,
    character: randomCharacter
  };
});

const start = async () => {
  try {
    // Load caches on start
    await Promise.all([
      fetchLolChampions(),
      fetchValorantAgents(),
      fetchOverwatchHeroes()
    ]);

    // Using 0.0.0.0 is required for Docker containers to be reachable from the host
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server testing: http://localhost:3000/api/randomizer/lol`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
