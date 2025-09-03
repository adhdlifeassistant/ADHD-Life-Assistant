import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/types/settings';

const ALLOWED_PROVIDERS: AIProvider[] = ['claude', 'gpt-4', 'gemini-pro'];

async function testClaudeConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Test' }]
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: 'Clé API incorrecte' };
    }
  } catch (error) {
    return { success: false, error: 'IA temporairement indisponible' };
  }
}

async function testGPT4Connection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: 'Clé API incorrecte' };
    }
  } catch (error) {
    return { success: false, error: 'IA temporairement indisponible' };
  }
}

async function testGeminiConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Test' }]
        }]
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: 'Clé API incorrecte' };
    }
  } catch (error) {
    return { success: false, error: 'IA temporairement indisponible' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Fournisseur IA et clé API requis' 
      }, { status: 400 });
    }

    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Fournisseur IA non autorisé' 
      }, { status: 400 });
    }

    let result: { success: boolean; error?: string };

    switch (provider) {
      case 'claude':
        result = await testClaudeConnection(apiKey);
        break;
      case 'gpt-4':
        result = await testGPT4Connection(apiKey);
        break;
      case 'gemini-pro':
        result = await testGeminiConnection(apiKey);
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Fournisseur IA non supporté' 
        }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors du test de connexion IA:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}