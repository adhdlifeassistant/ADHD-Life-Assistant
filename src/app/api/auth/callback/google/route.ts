import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 DEBUG: POST /api/auth/callback/google/ - DÉBUT');
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('📥 DEBUG: Request body:', requestBody);
    } catch (parseError) {
      console.error('❌ DEBUG: Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Corps de requête JSON invalide' 
      }, { status: 400 });
    }
    
    const { code, redirect_uri, state } = requestBody;

    if (!code) {
      console.log('❌ DEBUG: Code manquant dans la requête');
      return NextResponse.json({ 
        error: 'Code d\'autorisation manquant' 
      }, { status: 400 });
    }

    if (!redirect_uri) {
      console.log('❌ DEBUG: Redirect URI manquant dans la requête');
      return NextResponse.json({ 
        error: 'URL de redirection manquante' 
      }, { status: 400 });
    }

    if (!state) {
      console.log('❌ DEBUG: State manquant dans la requête');
      return NextResponse.json({ 
        error: 'Paramètre state manquant pour validation CSRF' 
      }, { status: 400 });
    }

    console.log('✅ DEBUG: Callback received with code:', code?.substring(0, 20) + '...');
    console.log('✅ DEBUG: Redirect URI:', redirect_uri);
    console.log('✅ DEBUG: State parameter:', state);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    console.log('🔑 DEBUG: Client ID présent:', !!clientId);
    console.log('🔑 DEBUG: Client Secret présent:', !!clientSecret);

    if (!clientId || !clientSecret) {
      console.error('❌ DEBUG: Missing Google OAuth credentials');
      return NextResponse.json({ 
        error: 'Configuration OAuth manquante' 
      }, { status: 500 });
    }

    console.log('🔄 DEBUG: Starting token exchange with Google...');
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

    console.log('📡 DEBUG: Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ DEBUG: Token exchange error:', errorData);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'échange du code d\'autorisation',
        details: errorData
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ DEBUG: Token exchange successful');
    console.log('🎫 DEBUG: Received tokens - access_token présent:', !!tokenData.access_token);
    console.log('🎫 DEBUG: Received tokens - refresh_token présent:', !!tokenData.refresh_token);

    console.log('👤 DEBUG: Fetching user info from Google API...');
    // Récupérer les informations utilisateur avec le token d'accès
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    
    console.log('📡 DEBUG: User info response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const userErrorData = await userResponse.json().catch(() => ({ error: 'Failed to parse user error' }));
      console.error('❌ DEBUG: User info fetch error:', userErrorData);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des informations utilisateur',
        details: userErrorData
      }, { status: 400 });
    }

    const userData = await userResponse.json();
    console.log('✅ DEBUG: User info retrieved for:', userData.email);
    console.log('👤 DEBUG: User data:', { id: userData.id, name: userData.name, email: userData.email, picture: !!userData.picture });

    const responseData = {
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
    };

    console.log('🎯 DEBUG: Sending success response to frontend');
    console.log('📤 DEBUG: Response includes - user:', !!responseData.user, 'access_token:', !!responseData.access_token);
    
    // Retourner les données utilisateur et les tokens
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 DEBUG: OAuth callback CRASH:', error);
    console.error('💥 DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}