import { type ReactNode } from 'react';
import { cx } from '../utils/classNames';

export interface ChatMessageData {
  body: ReactNode;
  sender: 'assistant' | 'user';
}

export function ChatThread({ messages }: { messages: readonly ChatMessageData[] }) {
  return (
    <div className="grid gap-lg" role="log">
      {messages.map((message, index) => (
        <div
          className={cx(
            'max-w-[74%] rounded-lg border px-xl py-lg text-body shadow-rest',
            message.sender === 'user'
              ? 'ml-auto border-brand-teal bg-brand-teal text-on-brand'
              : 'mr-auto border-card bg-surface-glass backdrop-blur-md shadow-glass-inset text-secondary',
          )}
          key={`chat-${message.sender}-${index}`}
        >
          {message.body}
        </div>
      ))}
    </div>
  );
}

