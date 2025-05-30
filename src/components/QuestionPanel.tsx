
import React from 'react';

interface QuestionPanelProps {
  question: string;
  questionNumber: number;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({ question, questionNumber }) => {
  return (
    <div className="question-panel mb-6 text-white relative">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-game-accent px-6 py-2 rounded-full text-white font-bold inline-block shadow-lg">
          Pergunta {questionNumber}
          <span className="ml-2">💡</span>
        </span>
      </div>
      
      {/* Removed 2D decorative elements */}
      
      <div className="pt-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          {question}
        </h2>
      </div>
      
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-game-yellow opacity-70"></div>
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-game-yellow opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-game-yellow opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-game-yellow opacity-70"></div>
    </div>
  );
};

export default QuestionPanel;
