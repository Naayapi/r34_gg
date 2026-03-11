import React, { useState } from 'react';
import axios from 'axios';
import { Gamepad2, Swords, Crosshair, Loader2, ImageOff } from 'lucide-react';

const API_BASE = '/api/randomizer';

function App() {
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Filters State
  const [gender, setGender] = useState('all');
  const [blacklist, setBlacklist] = useState('');

  const fetchRandomCharacter = async (game) => {
    setLoading(true);
    setError(null);
    setSelectedGame(game);
    setCharacterData(null);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (gender !== 'all') params.append('gender', gender);
      if (blacklist.trim() !== '') params.append('blacklist', blacklist.trim());

      const response = await axios.get(`${API_BASE}/${game}?${params.toString()}`);
      setCharacterData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch character. Make sure the backend is running and data is loaded.');
    } finally {
      setLoading(false);
    }
  };

  const games = [
    { id: 'lol', name: 'League of Legends', icon: <Swords size={24} className="mb-2" />, color: 'hover:bg-blue-600/20 hover:border-blue-500' },
    { id: 'valorant', name: 'Valorant', icon: <Crosshair size={24} className="mb-2" />, color: 'hover:bg-red-600/20 hover:border-red-500' },
    { id: 'overwatch', name: 'Overwatch', icon: <Gamepad2 size={24} className="mb-2" />, color: 'hover:bg-orange-600/20 hover:border-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 selection:bg-purple-500/30 font-sans text-zinc-100">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
          R34.GG Randomizer
        </h1>
        <p className="text-lg text-zinc-400">
          Select your battlefield, filter your preferences, and let fate decide.
        </p>
      </div>

      {/* Filters */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-center p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col w-full md:w-1/3 space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Gender Preference</label>
          <select 
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
          >
            <option value="all">Any Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-Binary</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-2/3 space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Blacklist Tags (Comma Separated)</label>
          <input 
            type="text"
            value={blacklist}
            onChange={(e) => setBlacklist(e.target.value)}
            placeholder="e.g. guro, furry, 3d"
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => fetchRandomCharacter(g.id)}
            disabled={loading}
            className={`
              flex flex-col items-center justify-center p-8 rounded-2xl 
              border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm
              transition-all duration-300 ease-out group md:hover:-translate-y-1
              ${g.color}
              ${selectedGame === g.id && loading ? 'animate-pulse ring-2 ring-purple-500/50 scale-[0.98]' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="text-zinc-400 group-hover:text-white transition-colors duration-300">
              {g.icon}
            </div>
            <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors duration-300">
              {g.name}
            </span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 max-w-md w-full text-center animate-in slide-in-from-bottom-2 fade-in duration-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300 py-12">
          <Loader2 size={48} className="animate-spin text-purple-500" />
          <p className="text-zinc-500 font-medium">Summoning the perfect character...</p>
        </div>
      )}

      {/* Result Display */}
      {characterData && !loading && !error && characterData.character && (
        <div className="w-full max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
            
            {/* Official Character Portrait */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-2 shadow-2xl w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
                  {characterData.character.image ? (
                    <img 
                      src={characterData.character.image} 
                      alt={characterData.character.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-2">
                      <ImageOff size={48} />
                      <p>Portrait Not Found</p>
                    </div>
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32 pb-8 px-6 text-center">
                    <p className="text-blue-400 font-medium tracking-wide uppercase text-xs mb-1">Official Selection</p>
                    <h2 className="text-4xl font-black text-white mb-1 drop-shadow-md">{characterData.character.name}</h2>
                    {(characterData.character.title || characterData.character.role) && (
                      <p className="text-zinc-300 font-medium uppercase text-sm drop-shadow">
                        {characterData.character.title || characterData.character.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rule34 Target Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-purple-500/30 p-2 shadow-[0_0_40px_-15px_rgba(168,85,247,0.3)] w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
                  {characterData.rule34?.image_url ? (
                    <img 
                      src={characterData.rule34.image_url} 
                      alt={`Rule34 for ${characterData.character.name}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-4 text-center px-8">
                      <ImageOff size={48} className="text-zinc-800" />
                      <div>
                        <p className="font-semibold text-zinc-500">No R34 Found</p>
                        <p className="text-sm text-zinc-600 mt-2">Try removing some blacklist tags, or maybe the character is too obscure.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent pt-6 pb-24 px-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <p className="text-pink-400 font-black tracking-widest uppercase text-sm drop-shadow-lg">R34 Result</p>
                  </div>

                  {characterData.rule34?.post_url && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center">
                      <a 
                        href={characterData.rule34.post_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-full shadow-lg shadow-pink-500/30 transform hover:-translate-y-1 transition-all duration-300"
                      >
                        View Original Source
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
