
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  customerName: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, customerName }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
          isModel
            ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}
      >
        <div className="text-xs font-semibold mb-1 uppercase tracking-wider opacity-70">
          {isModel ? customerName : 'Agent (You)'}
        </div>
        <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
