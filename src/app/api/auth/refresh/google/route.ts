import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json({ 
        error: 'Refresh token manquant' 
      }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials');
      return NextResponse.json({ 
        error: 'Configuration OAuth manquante' 
      }, { status: 500 });
    }

    console.log('🔍 DEBUG: Refreshing access token');

    // Renouveler le token d'accès
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', errorData);
      return NextResponse.json({ 
        error: 'Erreur lors du renouvellement du token' 
      }, { status: 400 });
    }

    const data = await response.json();
    console.log('🔍 DEBUG: Token refresh successful');

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
      // Le refresh token peut être mis à jour ou rester le même
      refresh_token: data.refresh_token || refresh_token,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}