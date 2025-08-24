# 🔒 Privacy & Security - ADHD Life Assistant

## 🛡️ Our Privacy Commitment

ADHD Life Assistant is designed with **privacy-first** principles. Your personal data stays **100% on your device** - we believe your mental health journey should remain private and under your control.

## 📊 What Data We Store

### ✅ Stored LOCALLY on your device:
- **Mood tracking data** - Your daily mood entries and patterns
- **Health information** - Medication logs, wellbeing metrics, appointments
- **Financial data** - Expense tracking, budgets, spending patterns
- **Tasks & cleaning** - Your completed tasks and productivity metrics
- **Personal settings** - Name, preferences, customizations
- **Analytics insights** - Pattern analysis generated from YOUR data only

### ❌ What we DON'T collect:
- No personal data sent to servers
- No tracking cookies or analytics
- No behavioral monitoring
- No user identification
- No location tracking
- No cross-site data sharing

## 🔐 Data Storage Technology

- **localStorage** - All data stored in your browser locally
- **No cloud storage** - Nothing leaves your device
- **No databases** - No external servers store your information
- **No user accounts** - No sign-up or login required

## 🌐 Network Requests

### Chat Module (Optional)
The **only** external connection is the Claude AI chat feature, which:
- Requires your explicit consent to use
- Only sends chat messages (not your personal data)
- Uses Anthropic's API with their privacy policies
- Can be completely disabled in settings

### No Other External Requests
- No analytics services (Google Analytics, etc.)
- No tracking pixels
- No telemetry or crash reporting
- No third-party integrations
- No social media connections

## 📤 Data Export & Control

You have **complete control** over your data:
- **Export** all your data in JSON format anytime
- **Import** data from previous exports
- **Delete** all data permanently with one click
- **No vendor lock-in** - your data is always portable

## 🔒 Security Measures

### Local Security
- Data stored in browser's secure localStorage
- No passwords or sensitive credentials stored
- No encryption needed (data never leaves device)

### Code Security  
- Open source codebase for transparency
- No obfuscated or hidden functionality
- Security headers implemented
- Content Security Policy enabled

## 🏥 Medical Data Sensitivity

We understand the sensitivity of ADHD-related health data:
- **No medical data sharing** - stays on your device only
- **No insurance tracking** - we don't know what you log
- **No employer monitoring** - completely private
- **HIPAA considerations** - no data transmission means no HIPAA concerns

## 🌍 GDPR & Data Protection Compliance

### Your Rights (always respected):
- **Right to access** - Export your data anytime
- **Right to rectification** - Edit your data freely  
- **Right to erasure** - Delete all data permanently
- **Right to portability** - Export in standard JSON format
- **Right to restrict processing** - Control what features you use

### No Consent Required for Core Features
Since no data leaves your device, most privacy regulations don't apply to local storage. However, we respect the **spirit** of privacy laws.

## 👥 Third-Party Services

### Claude AI Chat (Optional)
- **Service**: Anthropic's Claude API
- **Data sent**: Only your chat messages
- **Privacy policy**: https://www.anthropic.com/privacy
- **Control**: Can be disabled completely

### No Other Third Parties
- No advertising networks
- No analytics providers  
- No social media integrations
- No payment processors (app is free)

## 🔍 Data Minimization

We follow strict data minimization:
- Only collect data you explicitly enter
- No background data collection
- No device fingerprinting
- No behavioral profiling
- No predictive tracking

## 📱 PWA & Offline Functionality

- Works completely offline after first load
- No "phone home" functionality
- Your data travels with the app when installed as PWA
- No sync across devices (preserves privacy)

## 🆘 Support & Privacy

Need help? You can:
- Use the in-app help system (no data sent)
- Check the open source documentation
- Report issues without sharing personal data

We **cannot** help with data recovery if you lose it, because we don't have access to your data!

## 📋 Privacy Summary

| Aspect | ADHD Life Assistant | Typical Apps |
|--------|-------------------|--------------|
| Data location | Your device only ✅ | Company servers ❌ |
| User tracking | None ✅ | Extensive ❌ |
| Data sharing | None ✅ | Third parties ❌ |
| Analytics | None ✅ | Detailed tracking ❌ |
| Ads | None ✅ | Targeted ads ❌ |
| Login required | No ✅ | Yes ❌ |

## 🔒 Technical Implementation

For developers and security-conscious users:

```typescript
// Example of local-only storage
localStorage.setItem('adhd-mood-entries', JSON.stringify(data));
// ✅ Stays on device

// NO external requests like this:
// fetch('https://analytics.com/track', { data }) ❌
// google-analytics.com ❌
// facebook.com/pixel ❌
```

## 💜 Our Philosophy

Mental health is deeply personal. We believe:
- **Your brain, your data** - You own and control everything
- **Privacy by design** - Built privacy-first, not added as afterthought
- **Transparency** - Open source code you can audit
- **Respect** - For your neurodivergent journey and privacy needs

---

**Questions about privacy?** Remember, since your data never leaves your device, most privacy concerns simply don't apply to ADHD Life Assistant!

*Last updated: [Current Date]*
*Version: 1.0.0*