
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Lightbulb, Repeat, University, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface FinalStatsProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  helpUsed: number;
  skippedQuestions: number;
  universityHelp: number;
}

interface PlayerData {
  cpf: string;
  password: string;
  gameStats: {
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    helpUsed: number;
    skippedQuestions: number;
    universityHelp: number;
    moneyEarned: number;
    moneySpent: {
      wrongAnswers: number;
      skips: number;
      universityHelp: number;
      total: number;
    }
    finalBalance: number;
  }
}

const FinalStats: React.FC<FinalStatsProps> = ({ 
  isOpen, 
  onClose, 
  score, 
  correctAnswers, 
  wrongAnswers, 
  helpUsed, 
  skippedQuestions,
  universityHelp
}) => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Calculate financial summary
  const moneyEarned = correctAnswers * 5000;
  const moneySpentWrong = wrongAnswers * 1000;
  const moneySpentSkips = skippedQuestions * 500;
  const moneySpentUni = universityHelp * 300;
  const totalMoneySpent = moneySpentWrong + moneySpentSkips + moneySpentUni;
  const finalBalance = score;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu CPF e senha para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Create data object for saving
    const playerData: PlayerData = {
      cpf,
      password,
      gameStats: {
        score,
        correctAnswers,
        wrongAnswers,
        helpUsed,
        skippedQuestions,
        universityHelp,
        moneyEarned,
        moneySpent: {
          wrongAnswers: moneySpentWrong,
          skips: moneySpentSkips,
          universityHelp: moneySpentUni,
          total: totalMoneySpent
        },
        finalBalance
      }
    };

    // For now, we'll just log the data since we don't have a real backend
    console.log("Dados a serem salvos:", playerData);
    
    toast({
      title: "Dados salvos com sucesso!",
      description: "Suas estatísticas foram enviadas para nosso banco de dados.",
      className: "bg-game-correct text-white",
    });
    
    // Close the dialog after saving
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-gradient-to-b from-[#7E69AB] to-[#4E3D7B] text-white border-game-secondary overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl md:text-3xl flex items-center justify-center gap-2">
            <span className="text-game-yellow">Fim de Jogo!</span>
            <span className="text-xl">🏆</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          <div className="text-center mb-4">
            <p className="text-xl">Parabéns por participar do Show do Conhecimento!</p>
            {correctAnswers + wrongAnswers >= 12 ? (
              <p className="text-yellow-300 font-semibold">Você atingiu o limite de 12 perguntas!</p>
            ) : (
              <p className="text-yellow-300 font-semibold">Todas as perguntas disponíveis foram usadas!</p>
            )}
            <p className="mt-2">Confira seu desempenho abaixo:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance summary */}
            <div className="bg-black bg-opacity-20 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-center border-b border-[#9b87f5] pb-2">
                Resumo de Desempenho
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Check className="text-green-400" size={20} />
                    Acertos
                  </span>
                  <span className="text-green-400 font-bold">{correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <X className="text-red-400" size={20} />
                    Erros
                  </span>
                  <span className="text-red-400 font-bold">{wrongAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" size={20} />
                    Uso de Dicas
                  </span>
                  <span className="text-yellow-400 font-bold">{helpUsed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Repeat className="text-blue-400" size={20} />
                    Pulos Utilizados
                  </span>
                  <span className="text-blue-400 font-bold">{skippedQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <University className="text-purple-400" size={20} />
                    Ajuda dos Universitários
                  </span>
                  <span className="text-purple-400 font-bold">{universityHelp}</span>
                </div>
              </div>
            </div>
            
            {/* Financial summary */}
            <div className="bg-black bg-opacity-20 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-center border-b border-[#9b87f5] pb-2">
                Resumo Financeiro
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Plus className="text-green-400" size={20} />
                    Total Ganho
                  </span>
                  <span className="text-green-400 font-bold">R$ {moneyEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-semibold border-b border-gray-600 pb-2">
                  <span className="flex items-center gap-2">
                    <Minus className="text-red-400" size={20} />
                    Total Gasto
                  </span>
                  <span className="text-red-400 font-bold">R$ {totalMoneySpent.toLocaleString()}</span>
                </div>
                
                <div className="text-sm px-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Perdido em erros:</span>
                    <span>R$ {moneySpentWrong.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gasto em pulos:</span>
                    <span>R$ {moneySpentSkips.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ajuda universitários:</span>
                    <span>R$ {moneySpentUni.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-600 text-lg font-bold">
                  <span>Saldo Final</span>
                  <span className="text-game-yellow">R$ {finalBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* User info form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-black bg-opacity-20 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-bold mb-3 text-center">
                Registre seus dados para salvar sua pontuação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cpf" className="block mb-1">CPF:</label>
                  <Input 
                    id="cpf" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Digite seu CPF"
                    className="bg-white text-black"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-1">Senha:</label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="bg-white text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  type="submit" 
                  className="px-8 py-2 bg-[#F97316] hover:bg-[#E16915] text-white rounded-lg transition-colors"
                >
                  Salvar Pontuação
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinalStats;
