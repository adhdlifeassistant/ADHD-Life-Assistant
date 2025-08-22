#!/bin/bash

if [ -z "${ANTHROPIC_API_KEY}" ]; then
  echo "⚠️  ANTHROPIC_API_KEY is not set ⚠️"
  echo ""
  echo "To use Claude Code, you need to set the ANTHROPIC_API_KEY environment variable."
  echo "Steps to set up your API key:"
  echo "1. Go to: https://console.anthropic.com/keys"
  echo "2. Create a new API key"
  echo "3. Add it to your codespace secrets:"
  echo "   - Visit https://github.com/settings/codespaces"
  echo "   - Click \"New secret\""
  echo "   - Name: ANTHROPIC_API_KEY"
  echo "   - Value: Your API key from Anthropic Console"
  echo "   - Select either your repository or 'All repositories'"
  echo ""
  echo "Alternatively, you can set the key for your current session with:"
  echo "export ANTHROPIC_API_KEY=your-api-key-here"
else
  echo "✅ ANTHROPIC_API_KEY is set"
  echo "Claude Code is ready to use. Try running: claude"
fi
