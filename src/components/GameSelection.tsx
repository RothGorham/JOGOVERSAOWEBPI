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
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(76, 175, 80, 0.2)",
        transform: "perspective(1000px) rotateX(2deg)",
        background: "linear-gradient(to bottom, rgba(15, 40, 15, 0.9), rgba(10, 30, 10, 0.95))"
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl z-0 opacity-10">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-400 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400 to-transparent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10">
        {/* Game title */}
        <div className="relative text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white relative">
            <span className="absolute inset-0 text-game-yellow blur-[2px]">PoliMilian</span>
            <span className="relative z-10 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">PoliMilian</span>
          </h1>
        </div>
        
        {/* Poliedro Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="https://poliedro-api.p4ed.com/sso/auth/resources/vv3tb/login/updated-poliedro/dist/static/media/logo-sistema-p+.eb1179607d4dc652db31b1f92b5df4b5.svg" 
            alt="Poliedro Logo" 
            className="h-12 mt-2 mb-4"
          />
        </div>
        
        <div className="space-y-8 mt-6">
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
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
              }}
            >
              Iniciar Jogo
            </Button>
          </div>
          
          <div className="flex justify-center mt-4">
            <a href="http://localhost:8080/" className="inline-block">
              <Button 
                className="px-8 py-4 text-lg font-bold rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(45deg, #33691E, #4CAF50)',
                  boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
                }}
              >
                Voltar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;