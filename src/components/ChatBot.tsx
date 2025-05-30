
import React, { useState, useEffect } from 'react';
import { Bot, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, hint }) => {
  const [messages, setMessages] = useState<Array<{text: string; isBot: boolean}>>([]);
  
  useEffect(() => {
    if (isOpen) {
      // Reset messages when opened
      setMessages([
        { text: "Olá! Sou o universitário virtual, posso te ajudar com essa pergunta!", isBot: true },
      ]);
      
      // Add hint message with a delay to simulate typing
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { text: `Minha dica é: ${hint}`, isBot: true }]);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hint]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#7E69AB] text-white border-game-secondary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bot size={24} />
            <span>Ajuda dos Universitários</span>
            <span className="ml-2 text-xl">🎓</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-80">
          <div className="flex-1 overflow-y-auto p-4 rounded-md mb-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className="mb-4 p-4 rounded-lg bg-[#9b87f5] text-white"
              >
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-[#F97316] hover:bg-[#E16915] text-white rounded-lg transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBot;
