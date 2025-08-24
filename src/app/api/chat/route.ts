import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getMoodPrompt } from '@/lib/moodPrompts';
import { generatePersonalizedSystemPrompt, shouldPersonalizeResponse } from '@/lib/personalizedPrompts';
import { MoodType } from '@/types/mood';
import { UserProfile } from '@/types/profile';
import { AppSettings } from '@/types/settings';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, mood, conversationHistory, userProfile, appSettings } = await req.json();

    if (!message || !mood) {
      return NextResponse.json(
        { error: 'Message and mood are required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Génération du prompt système personnalisé
    let systemPrompt: string;
    
    if (userProfile && shouldPersonalizeResponse(userProfile as UserProfile)) {
      // Mode personnalisé : utilise le profil complet
      systemPrompt = generatePersonalizedSystemPrompt({
        profile: userProfile as UserProfile,
        settings: appSettings as AppSettings,
        currentMood: mood as MoodType
      });
    } else {
      // Mode standard : utilise seulement le mood
      systemPrompt = getMoodPrompt(mood as MoodType);
    }
    
    const messages = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}