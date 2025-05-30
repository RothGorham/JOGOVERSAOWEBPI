
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SkipForward, DollarSign, Receipt } from 'lucide-react';

interface StatsBoardProps {
  isOpen: boolean;
  onClose: () => void;
  skippedQuestions: number;
}

const StatsBoard: React.FC<StatsBoardProps> = ({ 
  isOpen, 
  onClose, 
  skippedQuestions 
}) => {
  // Calcular o custo do pulo atual e o total gasto com pulos
  const skipCost = 500; // Custo de cada pulo (R$ 500)
  const totalSkipCost = skippedQuestions * skipCost; // Total gasto com pulos

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-game-primary to-game-secondary text-white border-game-secondary">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl md:text-2xl">
            Nota Fiscal por Desistir
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {/* Pulos utilizados */}
          <div className="bg-black bg-opacity-20 p-4 rounded-lg flex flex-col items-center">
            <div className="flex items-center gap-2 text-game-yellow">
              <SkipForward size={24} />
              <span className="text-2xl md:text-3xl font-bold">{skippedQuestions}</span>
            </div>
            <div className="text-white text-center">Pulos Utilizados</div>
          </div>

          {/* Custo do pulo atual */}
          <div className="bg-black bg-opacity-20 p-4 rounded-lg flex flex-col items-center">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-2xl md:text-3xl font-bold">R$ {skipCost}</span>
            </div>
            <div className="text-white text-center">Custo deste Pulo</div>
          </div>

          {/* Total gasto com pulos */}
          <div className="bg-black bg-opacity-20 p-4 rounded-lg flex flex-col items-center">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-2xl md:text-3xl font-bold">R$ {totalSkipCost}</span>
            </div>
            <div className="text-white text-center">Total Gasto com Pulos</div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-game-accent hover:bg-game-secondary text-white rounded-lg transition-colors border-2 border-game-yellow shadow-md"
          >
            Próxima
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsBoard;
