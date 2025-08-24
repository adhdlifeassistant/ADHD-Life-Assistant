'use client';

import React, { useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { getTheme, currentMood } = useMood();

  useEffect(() => {
    const theme = getTheme();
    const root = document.documentElement;

    // Variables CSS principales
    root.style.setProperty('--mood-primary', theme.primary);
    root.style.setProperty('--mood-secondary', theme.secondary);
    root.style.setProperty('--mood-background', theme.background);
    root.style.setProperty('--mood-text', theme.text);
    root.style.setProperty('--mood-accent', theme.accent);

    // Variables CSS étendues pour effets avancés
    const primaryRgb = theme.primary.match(/\d+/g);
    if (primaryRgb) {
      const [r, g, b] = primaryRgb;
      root.style.setProperty('--mood-shadow', `rgba(${r}, ${g}, ${b}, 0.15)`);
      root.style.setProperty('--mood-border', `rgba(${r}, ${g}, ${b}, 0.2)`);
      root.style.setProperty('--mood-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);
    }

    // Application du thème au body
    document.body.style.background = theme.background;
    document.body.className = `mood-${currentMood}`;
    
    // Ajout de la classe mood au root pour les sélecteurs CSS
    root.classList.remove('mood-energetic', 'mood-normal', 'mood-tired', 'mood-stressed', 'mood-sad');
    root.classList.add(`mood-${currentMood}`);
  }, [currentMood, getTheme]);

  return <>{children}</>;
}