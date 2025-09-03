import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json();

    if (!code) {
      return NextResponse.json({ 
        error: 'Code d\'autorisation manquant' 
      }, { status: 400 });
    }

    if (!redirect_uri) {
      return NextResponse.json({ 
        error: 'URL de redirection manquante' 
      }, { status: 400 });
    }

    console.log('🔍 DEBUG: Callback received with code:', code);
    console.log('🔍 DEBUG: Redirect URI:', redirect_uri);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials');
      return NextResponse.json({ 
        error: 'Configuration OAuth manquante' 
      }, { status: 500 });
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'échange du code d\'autorisation' 
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('🔍 DEBUG: Token exchange successful');

    // Récupérer les informations utilisateur avec le token d'accès
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    
    if (!userResponse.ok) {
      console.error('User info fetch error');
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des informations utilisateur' 
      }, { status: 400 });
    }

    const userData = await userResponse.json();
    console.log('🔍 DEBUG: User info retrieved for:', userData.email);

    // Retourner les données utilisateur et les tokens
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}