
import React from 'react';

interface AnswerOption {
  id: string;
  text: string;
}

interface AnswerOptionsProps {
  options: AnswerOption[];
  onSelectAnswer: (id: string) => void;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({ options, onSelectAnswer }) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const letters = ["A", "B", "C", "D", "E"];
        return (
          <button 
            key={option.id}
            className="option-button bg-game-secondary hover:bg-game-primary text-white relative overflow-hidden group"
            onClick={() => onSelectAnswer(option.id)}
          >
            {/* Animated light effect on hover */}
            <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-all duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] skew-x-[-20deg]"></div>
            
            {/* Removed 2D button left decoration */}
            
            <span className="bg-white text-game-primary rounded-full w-9 h-9 flex items-center justify-center mr-4 font-bold shadow-inner">
              {letters[index]}
            </span>
            
            <span className="relative z-10">{option.text}</span>
            
            {/* Removed 2D button right decoration */}
            
            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20 transform"></div>
          </button>
        );
      })}
    </div>
  );
};

export default AnswerOptions;
