import React, { useState } from 'react';
import axios from 'axios';
import { Gamepad2, Swords, Crosshair, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/randomizer';

function App() {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchRandomCharacter = async (game) => {
    setLoading(true);
    setError(null);
    setSelectedGame(game);
    try {
      const response = await axios.get(`${API_BASE}/${game}`);
      setCharacter(response.data.character);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch character. Make sure the backend is running and data is loaded.');
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 selection:bg-purple-500/30">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
          R34.GG Randomizer
        </h1>
        <p className="text-lg text-zinc-400">
          Select your battlefield and let fate decide your next main.
        </p>
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
              transition-all duration-300 ease-out group
              ${g.color}
              ${selectedGame === g.id && loading ? 'animate-pulse ring-2 ring-purple-500/50' : ''}
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
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 max-w-md text-center">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <Loader2 size={48} className="animate-spin text-purple-500" />
          <p className="text-zinc-500 font-medium">Summoning...</p>
        </div>
      )}

      {/* Result Display */}
      {character && !loading && !error && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
          <div className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-2 shadow-2xl">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
              {character.image ? (
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="text-zinc-700">No Image Available</div>
              )}
              
              {/* Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32 pb-8 px-6">
                <h2 className="text-4xl font-bold text-white mb-2">{character.name}</h2>
                {(character.title || character.role) && (
                  <p className="text-purple-300 font-medium tracking-wide uppercase text-sm">
                    {character.title || character.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
