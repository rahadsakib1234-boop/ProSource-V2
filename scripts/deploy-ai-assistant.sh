#!/usr/bin/env sh
set -e

if [ -z "$GEMMA_API_KEY" ]; then
  echo "ERROR: GEMMA_API_KEY is required to deploy the ai-assistant Edge Function."
  exit 1
fi

supabase secrets set GEMMA_API_KEY="$GEMMA_API_KEY"

if [ -n "$SUPABASE_PROJECT_ID" ]; then
  supabase functions deploy ai-assistant --project "$SUPABASE_PROJECT_ID"
else
  supabase functions deploy ai-assistant
fi
