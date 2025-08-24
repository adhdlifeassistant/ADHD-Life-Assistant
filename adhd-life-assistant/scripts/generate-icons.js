const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration des icônes à générer
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG source - logo ADHD Life Assistant
const logoSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#1e40af" stroke-width="8"/>
  
  <!-- Brain icon stylized -->
  <g transform="translate(256,180)">
    <!-- Left brain hemisphere -->
    <path d="M-60,-40 C-80,-60 -100,-40 -100,-10 C-100,20 -80,40 -60,40 C-40,40 -40,20 -40,10 C-40,0 -50,-20 -60,-40 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Right brain hemisphere -->
    <path d="M60,-40 C80,-60 100,-40 100,-10 C100,20 80,40 60,40 C40,40 40,20 40,10 C40,0 50,-20 60,-40 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Connection -->
    <rect x="-40" y="0" width="80" height="20" fill="white" opacity="0.7" rx="10"/>
  </g>
  
  <!-- ADHD text stylized -->
  <g transform="translate(256,320)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" 
          font-size="42" font-weight="bold" text-anchor="middle" fill="white">
      ADHD
    </text>
    <text x="0" y="35" font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" font-weight="500" text-anchor="middle" fill="white" opacity="0.8">
      ASSISTANT
    </text>
  </g>
  
  <!-- Decorative elements -->
  <circle cx="150" cy="150" r="6" fill="url(#accent)" opacity="0.8"/>
  <circle cx="380" cy="180" r="8" fill="url(#accent)" opacity="0.6"/>
  <circle cx="180" cy="380" r="5" fill="url(#accent)" opacity="0.9"/>
  <circle cx="350" cy="350" r="7" fill="url(#accent)" opacity="0.7"/>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // S'assurer que le dossier public existe
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  console.log('🎨 Génération des icônes PWA...');
  
  for (const size of iconSizes) {
    try {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(logoSvg))
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Généré: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }
  
  // Générer le favicon
  try {
    const faviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(Buffer.from(logoSvg))
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✅ Généré: favicon.png');
  } catch (error) {
    console.error('❌ Erreur favicon:', error.message);
  }
  
  // Générer l'image Apple Touch
  try {
    const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(Buffer.from(logoSvg))
      .resize(180, 180)
      .png({ quality: 95 })
      .toFile(appleTouchPath);
    
    console.log('✅ Généré: apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Erreur Apple Touch:', error.message);
  }
  
  console.log('🎉 Toutes les icônes ont été générées !');
}

// Exécuter la génération
generateIcons().catch(console.error);