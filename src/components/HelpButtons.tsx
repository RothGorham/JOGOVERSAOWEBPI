
import React from 'react';
import { SkipForward, Heart } from 'lucide-react';

interface HelpButtonsProps {
  onUniversityHelp: () => void;
  onSkipQuestion: () => void;
  universityHelp?: number;
  currentHint?: string;
}

const HelpButtons: React.FC<HelpButtonsProps> = ({ onUniversityHelp, onSkipQuestion, universityHelp, currentHint }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-6">
      <button 
        className="help-button bg-gradient-to-r from-game-secondary to-game-primary text-white flex-1 relative overflow-hidden group"
        onClick={onUniversityHelp}
      >
        {/* Animated effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        
        <Heart size={24} className="mr-2 text-red-500 fill-red-500" />
        <span>Ajuda dos Universitários</span>
        <span className="ml-2 text-xl animate-bounce">🎓</span>
      </button>
      
      <button 
        className="help-button bg-gradient-to-r from-game-accent to-orange-600 text-white flex-1 relative overflow-hidden group"
        onClick={onSkipQuestion}
      >
        {/* Animated effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        
        <SkipForward size={24} className="mr-2" />
        <span>Pular Pergunta</span>
        <span className="ml-2 text-xl animate-pulse">🏃‍♂️</span>
      </button>
    </div>
  );
};

export default HelpButtons;
