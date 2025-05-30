import React, { useState } from 'react';
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
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [statsBoardOpen, setStatsBoardOpen] = useState(false);
  const [finalStatsOpen, setFinalStatsOpen] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  
  const { toast } = useToast();

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
        description: "A resposta correta era: CSS",
        variant: "destructive",
      });
      setWrongAnswers(wrongAnswers + 1);
    }
    
    // Check if this is the last question
    if (questionNumber >= 5) {
      setGameEnded(true);
      setFinalStatsOpen(true);
    } else {
      // Advance to next question
      setQuestionNumber(questionNumber + 1);
    }
  };

  const handleUniversityHelp = () => {
    setHelpUsed(helpUsed + 1);
    setUniversityHelp(universityHelp + 1);
    
    // Define a hint based on the current question
    const hint = "Pense na tecnologia que define estilos visuais como cores, fontes e layouts em uma página web.";
    setCurrentHint(hint);
    
    // Open the chatbot
    setChatbotOpen(true);
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions(skippedQuestions + 1);
    setHelpUsed(helpUsed + 1);
    setQuestionNumber(questionNumber + 1);
    
    // Show stats board
    setStatsBoardOpen(true);
    
    toast({
      title: "Pergunta pulada!",
      description: "Avançando para a próxima pergunta...",
      variant: "default",
      className: "bg-game-accent text-white",
    });
  };

  const handleFinishGame = () => {
    setFinalStatsOpen(false);
    
    // Reset game
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setHelpUsed(0);
    setUniversityHelp(0);
    setSkippedQuestions(0);
    setQuestionNumber(1);
    setGameEnded(false);
    setGameStarted(false);
    setSelectedDifficulty("");
    setSelectedSubject("");
    
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
    
    // Aqui você poderia carregar perguntas específicas baseadas na dificuldade e matéria
    // Por enquanto, vamos apenas mostrar um toast informando as seleções
    toast({
      title: "Jogo Iniciado!",
      description: `Dificuldade: ${difficulty}, Matéria: ${subject}`,
      variant: "default",
      className: "bg-game-primary text-white",
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
              backgroundColor: "rgba(15,20,40,0.9)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
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
        />
        
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
