'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ChatMessage, ChatConversation } from '@/types/chat';
import { getMoodGreeting } from '@/lib/moodPrompts';
import { getPersonalizedGreeting, getPersonalizedFallback } from '@/lib/personalizedGreetings';
import { MoodType } from '@/types/mood';

const getFallbackMessage = (mood: MoodType, profile?: any): string => {
  // Utilise le fallback personnalisé si profil disponible
  if (profile && profile.name) {
    return getPersonalizedFallback(profile, mood);
  }
  
  // Fallback standard
  const fallbacks = {
    energetic: "Oups ! Il y a eu un petit souci technique, mais ça ne va pas nous arrêter ! Qu'est-ce que tu voulais me dire ?",
    normal: "Désolé, j'ai rencontré un problème technique. Peux-tu reformuler ta question ?",
    tired: "Ah... il y a eu un petit problème de connexion. Pas de stress, reprends quand tu veux...",
    stressed: "Oups, un petit bug... mais ça va, respire. On peut réessayer calmement ?",
    sad: "Je suis désolé... il y a eu un problème technique. Je suis toujours là pour toi, réessaye quand tu peux..."
  };
  return fallbacks[mood];
};

export default function ChatInterface() {
  const { currentMood, getMoodConfig } = useMood();
  const { profile } = useProfile();
  const { settings } = useAppSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const moodConfig = getMoodConfig();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('adhd-chat-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const greetingContent = profile.name 
        ? getPersonalizedGreeting(profile, currentMood)
        : getMoodGreeting(currentMood);
        
      const greeting: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: greetingContent,
        timestamp: Date.now(),
        mood: currentMood
      };
      setMessages([greeting]);
    }
  }, [currentMood]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('adhd-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: Date.now(),
      mood: currentMood
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          mood: currentMood,
          conversationHistory: messages.slice(-10), // Keep last 10 messages for context
          userProfile: profile, // Profil utilisateur pour personnalisation
          appSettings: settings // Paramètres app pour contexte
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        mood: currentMood
      };

      setMessages([...newMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages(prevMessages => {
                  const updatedMessages = [...prevMessages];
                  const lastMessage = updatedMessages[updatedMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.text;
                  }
                  return updatedMessages;
                });
              }
            } catch (e) {
              // Ignore parsing errors for streaming chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback gracieux selon le mood et profil
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackMessage(currentMood, profile),
        timestamp: Date.now(),
        mood: currentMood
      };
      
      setMessages([...newMessages, fallbackMessage]);
      setError(null); // Clear error since we provided a fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('adhd-chat-messages');
    
    const greetingContent = profile.name 
      ? getPersonalizedGreeting(profile, currentMood)
      : getMoodGreeting(currentMood);
      
    const greeting: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: greetingContent,
      timestamp: Date.now(),
      mood: currentMood
    };
    setMessages([greeting]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-slate-200 ${moodConfig.bgColor} ${moodConfig.textColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{settings.avatar || moodConfig.emoji}</span>
            <div>
              <h3 className="font-semibold">
                {profile.name ? `Assistant de ${profile.name}` : 'Assistant Claude'}
              </h3>
              <p className="text-sm opacity-80">
                Mode {moodConfig.label}
                {profile.name && (
                  <>
                    {profile.chronotype && (
                      <> • {profile.chronotype === 'morning' ? '🌅 Matinal' : profile.chronotype === 'evening' ? '🦉 Nocturne' : '😴 Flexible'}</>
                    )}
                    {profile.medications.length > 0 && (
                      <> • {profile.medications.length} médication{profile.medications.length > 1 ? 's' : ''}</>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-sm px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            Nouveau chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? `${moodConfig.bgColor} ${moodConfig.textColor} ml-auto`
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-sm text-slate-600">Claude réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white/70">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={profile.name ? `Salut ${profile.name}, que puis-je faire pour toi ?` : "Tapez votre message..."}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--focus-ring-color': `var(--mood-primary)` } as React.CSSProperties}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${moodConfig.textColor} ${moodConfig.bgColor} ${moodConfig.hoverColor}`}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}