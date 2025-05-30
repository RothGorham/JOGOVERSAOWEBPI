import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BookOpen, Brain, Calculator, Trophy } from 'lucide-react';

interface GameSelectionProps {
  onStartGame: (difficulty: string, subject: string) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ onStartGame }) => {
  const [difficulty, setDifficulty] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  
  const handleStartGame = () => {
    if (difficulty && subject) {
      onStartGame(difficulty, subject);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-black bg-opacity-40 p-6 md:p-8 rounded-3xl backdrop-blur-sm shadow-2xl transform perspective-1000 rotateX-2 relative"
      style={{
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 10px rgba(255,255,255,0.1)",
        transform: "perspective(1000px) rotateX(2deg)"
      }}
    >
      {/* Game screen frame corners removed */}
      
      {/* Decorative elements removed */}
      
      {/* Game title */}
      <div className="relative text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white relative">
          <span className="absolute inset-0 text-game-yellow blur-[2px]">PoliMilian</span>
          <span className="relative z-10 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">PoliMilian</span>
        </h1>
      </div>
      
      <div className="space-y-8 mt-8">
        <div className="bg-black bg-opacity-20 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="text-game-yellow" />
            <span>Selecione a Dificuldade</span>
          </h2>
          
          <RadioGroup value={difficulty} onValueChange={setDifficulty} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg transition-all ${difficulty === 'facil' ? 'bg-game-primary' : 'bg-black bg-opacity-30 hover:bg-opacity-40'}`}>
              <RadioGroupItem value="facil" id="facil" className="sr-only" />
              <Label htmlFor="facil" className="flex flex-col items-center justify-center cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                  <span className="text-white text-xl">1</span>
                </div>
                <span className="text-xl font-bold text-white">Fácil</span>
                <p className="text-gray-300 text-sm text-center mt-1">Perguntas básicas para iniciantes</p>
              </Label>
            </div>
            
            <div className={`p-4 rounded-lg transition-all ${difficulty === 'medio' ? 'bg-game-primary' : 'bg-black bg-opacity-30 hover:bg-opacity-40'}`}>
              <RadioGroupItem value="medio" id="medio" className="sr-only" />
              <Label htmlFor="medio" className="flex flex-col items-center justify-center cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mb-2">
                  <span className="text-white text-xl">2</span>
                </div>
                <span className="text-xl font-bold text-white">Médio</span>
                <p className="text-gray-300 text-sm text-center mt-1">Desafio intermediário</p>
              </Label>
            </div>
            
            <div className={`p-4 rounded-lg transition-all ${difficulty === 'dificil' ? 'bg-game-primary' : 'bg-black bg-opacity-30 hover:bg-opacity-40'}`}>
              <RadioGroupItem value="dificil" id="dificil" className="sr-only" />
              <Label htmlFor="dificil" className="flex flex-col items-center justify-center cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                  <span className="text-white text-xl">3</span>
                </div>
                <span className="text-xl font-bold text-white">Difícil</span>
                <p className="text-gray-300 text-sm text-center mt-1">Apenas para especialistas</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="bg-black bg-opacity-20 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="text-game-yellow" />
            <span>Selecione a Matéria</span>
          </h2>
          
          <RadioGroup value={subject} onValueChange={setSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg transition-all ${subject === 'matematica' ? 'bg-game-primary' : 'bg-black bg-opacity-30 hover:bg-opacity-40'}`}>
              <RadioGroupItem value="matematica" id="matematica" className="sr-only" />
              <Label htmlFor="matematica" className="flex flex-col items-center justify-center cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                  <Calculator className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Matemática</span>
                <p className="text-gray-300 text-sm text-center mt-1">Desafios numéricos e lógicos</p>
              </Label>
            </div>
            
            <div className={`p-4 rounded-lg transition-all ${subject === 'misto' ? 'bg-game-primary' : 'bg-black bg-opacity-30 hover:bg-opacity-40'}`}>
              <RadioGroupItem value="misto" id="misto" className="sr-only" />
              <Label htmlFor="misto" className="flex flex-col items-center justify-center cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                  <Brain className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Misto</span>
                <p className="text-gray-300 text-sm text-center mt-1">Várias disciplinas combinadas</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleStartGame}
            disabled={!difficulty || !subject}
            className={`px-8 py-6 text-xl font-bold rounded-xl transition-all ${(!difficulty || !subject) ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-slow hover:animate-none'}`}
            style={{
              background: 'linear-gradient(45deg, #6E59A5, #9b87f5)',
              boxShadow: '0 0 15px rgba(110, 89, 165, 0.5)'
            }}
          >
            Iniciar Jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;