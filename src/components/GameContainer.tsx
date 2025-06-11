import React, { useState, useEffect } from 'react';
import PlayerStatus from './PlayerStatus';
import QuestionPanel from './QuestionPanel';
import AnswerOptions from './AnswerOptions';
import HelpButtons from './HelpButtons';
import ChatBot from './ChatBot';
import StatsBoard from './StatsBoard';
import FinalStats from './FinalStats';
import GameSelection from './GameSelection';
import { useToast } from '@/components/ui/use-toast';

const mockQuestion = {
  id: '1',
  text: 'Qual dessas tecnologias é usada para estilizar páginas web?',
  options: [
    { id: 'a', text: 'JavaScript' },
    { id: 'b', text: 'HTML' },
    { id: 'c', text: 'CSS' },
    { id: 'd', text: 'PHP' },
    { id: 'e', text: 'SQL' },
  ],
  correctAnswer: 'c'
};

const GameContainer: React.FC = () => {
  // Game selection states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [helpUsed, setHelpUsed] = useState(0);
  const [universityHelp, setUniversityHelp] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(mockQuestion);
  const [questionNumber, setQuestionNumber] = useState(1);
const MAX_QUESTIONS = 12; // Número máximo de perguntas antes de encerrar o jogo
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [statsBoardOpen, setStatsBoardOpen] = useState(false);
  const [finalStatsOpen, setFinalStatsOpen] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  
  const { toast } = useToast();

  // Efeito para reiniciar a partida quando o jogador estiver na tela de seleção
  useEffect(() => {
    // Se o jogo não estiver iniciado e não estiver mostrando estatísticas finais, reiniciar variáveis
    if (!gameStarted && !finalStatsOpen) {
      resetGame();
      
      // Limpar a lista de perguntas usadas no servidor
      fetch('/reset-perguntas-usadas', { method: 'POST' })
        .then(response => {
          if (response.ok) {
            console.log('Lista de perguntas usadas resetada com sucesso');
          }
        })
        .catch(error => {
          console.error('Erro ao resetar lista de perguntas usadas:', error);
        });
    }
  }, [gameStarted, finalStatsOpen]);

  const handleSelectAnswer = (id: string) => {
    if (id === currentQuestion.correctAnswer) {
      // Correct answer
      toast({
        title: "Resposta Correta!",
        description: "Você ganhou R$ 5.000!",
        variant: "default",
        className: "bg-game-correct text-white",
      });
      setScore(score + 5000);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      // Wrong answer
      toast({
        title: "Resposta Errada!",
        description: `A resposta correta era: ${currentQuestion.correctAnswer}`,
        variant: "destructive",
      });
      setWrongAnswers(wrongAnswers + 1);
    }
    
    // Check if this is the last question (12 perguntas no total)
    if (questionNumber >= MAX_QUESTIONS) {
      setGameEnded(true);
      setFinalStatsOpen(true);
      
      toast({
        title: "Fim de Jogo!",
        description: "Você atingiu o limite de 12 perguntas!",
        variant: "default",
        className: "bg-game-primary text-white",
      });
    } else {
      // Advance to next question
      setQuestionNumber(questionNumber + 1);
      
      // Buscar próxima pergunta
      fetch(`/pergunta?nivel=${selectedDifficulty}&materia=${selectedSubject}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              return response.json().then(data => {
                // Verificar se o jogo acabou porque todas as perguntas foram usadas
                if (data.gameOver) {
                  setGameEnded(true);
                  setFinalStatsOpen(true);
                  
                  toast({
                    title: "Fim de Jogo!",
                    description: "Todas as perguntas disponíveis foram usadas!",
                    variant: "default",
                    className: "bg-game-primary text-white",
                  });
                  
                  throw new Error(data.erro || 'Todas as perguntas já foram usadas. Reinicie a partida.');
                }
                throw new Error(data.erro || 'Não foi possível encontrar mais perguntas');
              });
            }
            throw new Error('Erro ao buscar próxima pergunta');
          }
          return response.json();
        })
        .then(data => {
          // Atualizar o estado com a pergunta recebida
          setCurrentQuestion({
            id: data.id,
            text: data.pergunta,
            options: data.alternativas.map((alt, index) => ({
              id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd', 'e'
              text: alt
            })),
            correctAnswer: data.correta
          });
        })
        .catch(error => {
          console.error('Erro:', error);
          toast({
            title: "Erro ao buscar próxima pergunta",
            description: error.message,
            variant: "destructive",
          });
          // Finalizar o jogo em caso de erro
          setGameEnded(true);
          setFinalStatsOpen(true);
        });
    }
  };

  const handleUniversityHelp = () => {
    setHelpUsed(helpUsed + 1);
    setUniversityHelp(universityHelp + 1);
    
    // Mostrar toast de carregamento
    toast({
      title: "Buscando ajuda...",
      description: "Consultando os universitários...",
      variant: "default",
      className: "bg-game-accent text-white",
    });
    
    // Buscar dica da API
    fetch('/dica')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar dica');
        }
        // Primeiro obter o texto da resposta para verificar se é um JSON válido
        return response.text();
      })
      .then(text => {
        console.log("Texto recebido da API:", text);
        
        try {
          // Remover possíveis caracteres DOCTYPE ou outros inválidos
          const cleanText = text.replace(/<!DOCTYPE[^>]*>/g, '').trim();
          const data = JSON.parse(cleanText);
          console.log("Dados processados:", data);
          
          if (data.processando) {
            // Se a IA estiver processando, mostrar mensagem de espera
            setCurrentHint("Estamos processando sua dica. Por favor, aguarde um momento...");
          } else if (data.dica) {
            // Se recebeu a dica com sucesso
            console.log("Dica recebida:", data.dica);
            // Garantir que a dica seja uma string
            const dicaString = typeof data.dica === 'string' ? data.dica : JSON.stringify(data.dica);
            setCurrentHint(dicaString);
          } else {
            // Fallback para caso não receba dica
            setCurrentHint("Tente pensar nos conceitos fundamentais relacionados à pergunta.");
          }
        } catch (error) {
          console.error("Erro ao processar resposta:", error);
          // Se não conseguir processar como JSON, usar uma dica genérica
          setCurrentHint("Não foi possível processar a resposta do servidor. Tente novamente.");
        }
        
        // Open the chatbot
        setChatbotOpen(true);
      })
      .catch(error => {
        console.error('Erro:', error);
        // Definir uma dica genérica em caso de erro
        setCurrentHint("Não foi possível obter uma dica específica. Tente analisar as alternativas com calma.");
        
        // Open the chatbot mesmo com erro
        setChatbotOpen(true);
        
        toast({
          title: "Erro ao buscar dica",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions(skippedQuestions + 1);
    setHelpUsed(helpUsed + 1);
    setQuestionNumber(questionNumber + 1);
    
    // Verificar se atingiu o número máximo de perguntas
    if (questionNumber + 1 >= MAX_QUESTIONS) {
      setGameEnded(true);
      setFinalStatsOpen(true);
      return;
    }
    
    // Show stats board
    setStatsBoardOpen(true);
    
    toast({
      title: "Pergunta pulada!",
      description: "Avançando para a próxima pergunta...",
      variant: "default",
      className: "bg-game-accent text-white",
    });
    
    // Buscar próxima pergunta
    fetch(`/pergunta?nivel=${selectedDifficulty}&materia=${selectedSubject}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            return response.json().then(data => {
              // Verificar se o jogo acabou porque todas as perguntas foram usadas
               if (data.gameOver) {
                 setGameEnded(true);
                 setFinalStatsOpen(true);
                 
                 toast({
                   title: "Fim de Jogo!",
                   description: "Todas as perguntas disponíveis foram usadas!",
                   variant: "default",
                   className: "bg-game-primary text-white",
                 });
                 
                 throw new Error(data.erro || 'Todas as perguntas já foram usadas. Reinicie a partida.');
               }
              throw new Error(data.erro || 'Não foi possível encontrar mais perguntas');
            });
          }
          throw new Error('Erro ao buscar próxima pergunta');
        }
        return response.json();
      })
      .then(data => {
        // Atualizar o estado com a pergunta recebida
        setCurrentQuestion({
          id: data.id,
          text: data.pergunta,
          options: data.alternativas.map((alt, index) => ({
            id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd', 'e'
            text: alt
          })),
          correctAnswer: data.correta
        });
      })
      .catch(error => {
        console.error('Erro:', error);
        toast({
          title: "Erro ao buscar próxima pergunta",
          description: error.message,
          variant: "destructive",
        });
        // Finalizar o jogo em caso de erro
        setGameEnded(true);
        setFinalStatsOpen(true);
      });
  };

  const resetGame = () => {
    // Reset game
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setHelpUsed(0);
    setUniversityHelp(0);
    setSkippedQuestions(0);
    setQuestionNumber(1);
    setGameEnded(false);
    setSelectedDifficulty("");
    setSelectedSubject("");
    
    // Limpar a pergunta atual
    setCurrentQuestion(mockQuestion);
    
    // Limpar as variáveis de estado dos modais
    setChatbotOpen(false);
    setStatsBoardOpen(false);
  };
  
  const handleFinishGame = () => {
    setFinalStatsOpen(false);
    setGameStarted(false);
    resetGame();
    
    toast({
      title: "Jogo Finalizado!",
      description: "Seus dados foram salvos com sucesso!",
      variant: "default",
      className: "bg-game-primary text-white",
    });
  };
  
  const handleStartGame = (difficulty: string, subject: string) => {
    setSelectedDifficulty(difficulty);
    setSelectedSubject(subject);
    setGameStarted(true);
    
    // Carregar a primeira pergunta com base na dificuldade e matéria selecionadas
    fetch(`/pergunta?nivel=${difficulty}&materia=${subject}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            return response.json().then(data => {
              // Verificar se o jogo acabou porque todas as perguntas foram usadas
               if (data.gameOver) {
                 setGameEnded(true);
                 setFinalStatsOpen(true);
                 
                 toast({
                   title: "Fim de Jogo!",
                   description: "Todas as perguntas disponíveis foram usadas!",
                   variant: "default",
                   className: "bg-game-primary text-white",
                 });
                 
                 throw new Error(data.erro || 'Todas as perguntas já foram usadas. Reinicie a partida.');
               }
              throw new Error(data.erro || 'Não foi possível encontrar perguntas com esses filtros');
            });
          }
          throw new Error('Erro ao buscar pergunta');
        }
        return response.json();
      })
      .then(data => {
        // Atualizar o estado com a pergunta recebida
        setCurrentQuestion({
          id: data.id,
          text: data.pergunta,
          options: data.alternativas.map((alt, index) => ({
            id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd', 'e'
            text: alt
          })),
          correctAnswer: data.correta
        });
        
        toast({
          title: "Jogo Iniciado!",
          description: `Dificuldade: ${difficulty}, Matéria: ${subject}`,
          variant: "default",
          className: "bg-game-primary text-white",
        });
      })
      .catch(error => {
        console.error('Erro:', error);
        toast({
          title: "Erro ao iniciar o jogo",
          description: error.message,
          variant: "destructive",
        });
        // Voltar para a tela de seleção em caso de erro
        setGameStarted(false);
      });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" style={{
      backgroundImage: "url('/background_sem_texto.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {!gameStarted ? (
        <GameSelection onStartGame={handleStartGame} />
      ) : (
        <>
          {/* Game content container */}
          <div 
            className="w-full max-w-4xl bg-black bg-opacity-40 p-6 md:p-8 rounded-3xl backdrop-blur-sm shadow-2xl transform perspective-1000 rotateX-2 relative" 
            style={{
              background: "linear-gradient(to bottom, rgba(15, 40, 15, 0.9), rgba(10, 30, 10, 0.95))",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(76, 175, 80, 0.2)",
              transform: "perspective(1000px) rotateX(2deg)"
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
            
              <PlayerStatus 
                score={score}
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
                helpUsed={helpUsed}
              />
            
              <div className="my-6 relative">
                <div className="absolute inset-0 bg-game-primary rounded-2xl blur-md -z-10 opacity-20"></div>
                <QuestionPanel 
                  question={currentQuestion.text}
                  questionNumber={questionNumber}
                />
                
                <AnswerOptions 
                  options={currentQuestion.options}
                  onSelectAnswer={handleSelectAnswer}
                />
              </div>
              
              <HelpButtons 
                onUniversityHelp={handleUniversityHelp}
                onSkipQuestion={handleSkipQuestion}
                universityHelp={universityHelp}
                currentHint={currentHint}
              />
            </div>
            {/* Game container end */}
          </div>
          
          {/* Chatbot for university help */}
          <ChatBot 
            isOpen={chatbotOpen}
            onClose={() => setChatbotOpen(false)}
            hint={currentHint}
          />
          
          {/* Stats board when skipping */}
          <StatsBoard
            isOpen={statsBoardOpen}
            onClose={() => setStatsBoardOpen(false)}
            skippedQuestions={skippedQuestions}
          />
          
          {/* Final stats at end of game */}
          <FinalStats
            isOpen={finalStatsOpen}
            onClose={handleFinishGame}
            score={score}
            correctAnswers={correctAnswers}
            wrongAnswers={wrongAnswers}
            helpUsed={helpUsed}
            skippedQuestions={skippedQuestions}
            universityHelp={universityHelp}
          />
        </>
      )}
    </div>
  );
};

export default GameContainer;
