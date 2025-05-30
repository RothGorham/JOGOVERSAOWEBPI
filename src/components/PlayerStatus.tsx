
import React from 'react';
import { Trophy, Star, CircleX } from 'lucide-react';

interface PlayerStatusProps {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  helpUsed: number;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ 
  score, 
  correctAnswers, 
  wrongAnswers,
  helpUsed 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="game-card bg-gradient-to-br from-game-secondary to-game-primary text-white transform transition-transform hover:scale-105">
        <div className="text-center">
          <h3 className="text-xl font-bold">Saldo</h3>
          <p className="text-2xl font-bold text-game-yellow drop-shadow-glow">
            R$ {score.toLocaleString()}
          </p>
        </div>
        <div className="absolute inset-0 border-2 border-game-yellow opacity-10 rounded-lg"></div>
      </div>
      
      <div className="game-card bg-gradient-to-br from-green-600 to-game-correct text-white transform transition-transform hover:scale-105">
        <div className="text-center">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Trophy size={20} /> Acertos
          </h3>
          <p className="text-2xl font-bold">{correctAnswers}</p>
        </div>
        <div className="absolute inset-0 border-2 border-white opacity-10 rounded-lg"></div>
      </div>
      
      <div className="game-card bg-gradient-to-br from-red-800 to-game-wrong text-white transform transition-transform hover:scale-105">
        <div className="text-center">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <CircleX size={20} /> Erros
          </h3>
          <p className="text-2xl font-bold">{wrongAnswers}</p>
        </div>
        <div className="absolute inset-0 border-2 border-white opacity-10 rounded-lg"></div>
      </div>
      
      <div className="game-card bg-gradient-to-br from-yellow-600 to-game-accent text-white transform transition-transform hover:scale-105">
        <div className="text-center">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Star size={20} /> Ajudas
          </h3>
          <p className="text-2xl font-bold">{helpUsed}</p>
        </div>
        <div className="absolute inset-0 border-2 border-white opacity-10 rounded-lg"></div>
      </div>
    </div>
  );
};

export default PlayerStatus;
