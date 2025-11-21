#!/bin/bash
# Script to load .env.local and start vercel dev

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
  echo "Loaded environment variables from .env.local"
  echo "STRIPE_SECRET_KEY is set: $([ -n "$STRIPE_SECRET_KEY" ] && echo "Yes" || echo "No")"
else
  echo "Warning: .env.local file not found"
fi

# Start vercel dev
vercel dev

