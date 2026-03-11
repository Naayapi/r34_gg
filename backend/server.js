require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fs = require('fs');
const path = require('path');
const { formatRule34Tag } = require('./utils/tagFormatter');

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: '*'
});

const CACHE_FILE = path.join(__dirname, 'data', 'cache.json');
const GENDERS_FILE = path.join(__dirname, 'data', 'genders.json');

let cache = {
  lol: [],
  valorant: [],
  overwatch: []
};

let genders = {};

// Load genders
try {
  if (fs.existsSync(GENDERS_FILE)) {
    genders = JSON.parse(fs.readFileSync(GENDERS_FILE, 'utf8'));
  }
} catch (e) {
  fastify.log.error('Failed to load genders.json', e);
}

// Load cache if exists
try {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    fastify.log.info('Loaded characters from local cache.');
  }
} catch (e) {
  fastify.log.error('Failed to load cache.json', e);
}

function saveCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    fastify.log.error('Failed to save cache.json', e);
  }
}

// Fetch League of Legends Champions
async function fetchLolChampions() {
  if (cache.lol.length > 0) return;
  try {
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionRes.json();
    const latestVersion = versions[0];
    const champsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const champsData = await champsRes.json();
    
    cache.lol = Object.values(champsData.data).map(champ => ({
      id: champ.id,
      name: champ.name,
      title: champ.title,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`
    }));
    fastify.log.info(`Fetched ${cache.lol.length} LoL champions.`);
  } catch (err) {
    fastify.log.error('Failed to load LoL champions:', err);
  }
}

// Fetch Valorant Agents
async function fetchValorantAgents() {
  if (cache.valorant.length > 0) return;
  try {
    const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const data = await res.json();
    
    cache.valorant = data.data.map(agent => ({
      id: agent.uuid,
      name: agent.displayName,
      role: agent.role ? agent.role.displayName : 'Unknown',
      image: agent.displayIcon
    }));
    fastify.log.info(`Fetched ${cache.valorant.length} Valorant agents.`);
  } catch (err) {
    fastify.log.error('Failed to load Valorant agents:', err);
  }
}

// Fetch Overwatch Heroes
async function fetchOverwatchHeroes() {
  if (cache.overwatch.length > 0) return;
  try {
    const res = await fetch('https://overfast-api.tekrop.fr/heroes');
    const data = await res.json();
    
    cache.overwatch = data.map(hero => ({
      id: hero.key,
      name: hero.name,
      role: hero.role,
      image: hero.portrait
    }));
    fastify.log.info(`Fetched ${cache.overwatch.length} Overwatch heroes.`);
  } catch (err) {
    fastify.log.error('Failed to load Overwatch heroes:', err);
  }
}

fastify.get('/api/randomizer/:game', async (request, reply) => {
  const game = request.params.game.toLowerCase();
  const { gender, blacklist } = request.query;
  
  if (!cache[game] || cache[game].length === 0) {
    return reply.status(404).send({ error: 'Game not found or data not loaded yet. Valid games: lol, valorant, overwatch' });
  }

  let characters = cache[game];

  // Filter by gender if specified
  if (gender && gender !== 'all') {
    characters = characters.filter(char => {
      const charName = char.name.toLowerCase();
      const charGender = genders[charName] || 'unknown';
      return charGender === gender.toLowerCase();
    });
  }

  if (characters.length === 0) {
    return reply.status(404).send({ error: 'No characters found matching the selected filters.' });
  }

  const randomIndex = Math.floor(Math.random() * characters.length);
  const randomCharacter = characters[randomIndex];

  // Process Rule34
  let rule34Data = null;
  const tag = formatRule34Tag(randomCharacter.name, game);
  let tagsQuery = tag;
  
  // Rule34 random sort is 'sort:random'
  tagsQuery += '+sort:random';

  if (blacklist) {
    const blacklistTags = blacklist.split(',').map(t => `-${t.trim()}`).join('+');
    if (blacklistTags) {
      tagsQuery += `+${blacklistTags}`;
    }
  }

  let apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=1&tags=${tagsQuery}`;
  if (process.env.RULE34_API_KEY && process.env.RULE34_USER_ID) {
    apiUrl += `&api_key=${process.env.RULE34_API_KEY}&user_id=${process.env.RULE34_USER_ID}`;
  }

  try {
    const r34Res = await fetch(apiUrl);
    if (r34Res.ok) {
      const r34Text = await r34Res.text();
      if (r34Text) {
        const r34Json = JSON.parse(r34Text);
        if (r34Json && r34Json.length > 0) {
          rule34Data = {
            image_url: r34Json[0].file_url,
            post_url: `https://rule34.xxx/index.php?page=post&s=view&id=${r34Json[0].id}`
          };
        }
      }
    }
  } catch (err) {
    fastify.log.error(`Rule34 API fetch failed for tag ${tag}`, err);
  }

  return {
    game: game,
    character: randomCharacter,
    rule34: rule34Data
  };
});

const start = async () => {
  try {
    // We don't block startup. We just fire the fetches in the background and save cache if anything updated.
    Promise.all([
      fetchLolChampions(),
      fetchValorantAgents(),
      fetchOverwatchHeroes()
    ]).then(() => {
      saveCache();
      fastify.log.info('External character data fetched and cache updated (if needed).');
    }).catch(err => {
      fastify.log.error('Background fetch failed (non-blocking).', err);
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server testing: http://localhost:3000/api/randomizer/lol`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
