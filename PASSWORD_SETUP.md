# 🔐 Protection par Mot de Passe - Instructions

## ✅ IMPLEMENTATION TERMINÉE

Le système de protection par mot de passe a été ajouté avec succès à votre application ADHD Life Assistant.

## 🔑 MOT DE PASSE ACTUEL
**Mot de passe :** `fYnkUShy513ZNF`

## 🚀 FONCTIONNEMENT

1. **Premier accès** → Page de login affichée automatiquement
2. **Mot de passe correct** → Accès à l'application normale
3. **Session maintenue** → Pas de re-login tant que l'onglet reste ouvert
4. **Bouton déconnexion** → Coin supérieur droit pour se déconnecter

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### Nouveaux composants :
- `src/components/auth/LoginPage.tsx` - Interface de connexion
- `src/components/auth/PasswordProtection.tsx` - Logique de protection

### Fichier modifié :
- `src/app/layout.tsx` - Wrapper ajouté autour de l'app

## 🛠️ MODIFICATION DU MOT DE PASSE

Pour changer le mot de passe, modifiez cette ligne dans `src/components/auth/PasswordProtection.tsx:20` :

```typescript
const EXPECTED_HASH = 'nouveau_hash_md5'; // Remplacer par le hash MD5 du nouveau mot de passe
```

**Générer un hash MD5 :** Utilisez un outil en ligne ou Node.js :
```javascript
require('crypto-js/md5')('nouveau_mot_de_passe').toString()
```

## 🗑️ SUPPRESSION DE LA PROTECTION

Pour retirer facilement cette protection plus tard :

1. **Supprimer les fichiers :**
   - `src/components/auth/LoginPage.tsx`
   - `src/components/auth/PasswordProtection.tsx`

2. **Restaurer layout.tsx :**
   - Enlever l'import : `import PasswordProtection from "@/components/auth/PasswordProtection";`
   - Retirer le wrapper `<PasswordProtection>` et `</PasswordProtection>`

3. **Désinstaller crypto-js (optionnel) :**
   ```bash
   npm uninstall crypto-js @types/crypto-js
   ```

## 🔒 SÉCURITÉ

- Le mot de passe est hashé en MD5 (obfuscation basique)
- Session stockée dans `sessionStorage` (perdue à la fermeture du navigateur)
- Protection adéquate pour un usage personnel

## 🎨 DESIGN

- Interface épurée et apaisante (ADHD-friendly)
- Design responsive mobile/desktop
- Animations fluides et non distrayantes
- Cohérent avec le style de l'app principale

**✨ L'application est maintenant protégée et prête à l'emploi !**