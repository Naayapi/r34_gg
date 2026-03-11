// backend/utils/tagFormatter.js

/**
 * Formats a character name and game into a valid Rule34 tag.
 * @param {string} characterName 
 * @param {string} game 
 * @returns {string} The formatted tag
 */
function formatRule34Tag(characterName, game) {
  // Convert to lowercase and replace spaces with underscores
  let baseTag = characterName.toLowerCase().replace(/\s+/g, '_');

  // Handle specific characters or edge cases
  if (baseTag === 'd.va') baseTag = 'd.va';
  if (baseTag === 'soldier:_76') baseTag = 'soldier_76';
  if (baseTag === 'kay/o') baseTag = 'kay/o';
  if (baseTag === "bel'veth") baseTag = "belveth";
  
  // Clean up any remaining quotes or unwanted chars
  baseTag = baseTag.replace(/[']/g, '');

  let gameTag = '';
  switch (game.toLowerCase()) {
    case 'lol':
      gameTag = 'league_of_legends';
      break;
    case 'valorant':
      gameTag = 'valorant';
      break;
    case 'overwatch':
      gameTag = 'overwatch';
      break;
    default:
      gameTag = game;
  }

  // Common rule34 format: character_name_(game_name)
  // For some cases, just the character name if game is not strictly needed, 
  // but adding the game tag in parentheses is the standard convention on Danbooru-like boorus for disambiguation.
  return `${baseTag}_(${gameTag})`;
}

module.exports = {
  formatRule34Tag
};
