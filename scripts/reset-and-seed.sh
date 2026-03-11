#!/bin/bash
# VotoAbierto — Reset and Seed Script
# Seeds the Supabase database from all seed data files.
# Migrations must be applied manually in Supabase SQL editor first.
#
# Usage:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
#   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
#   bash scripts/reset-and-seed.sh

set -euo pipefail

# Check required env vars
if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
  echo "   Export it before running this script"
  exit 1
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY is not set"
  echo "   Export it before running this script"
  echo "   Find it in: Supabase Dashboard → Project Settings → API → service_role key"
  exit 1
fi

echo "🇵🇪 VotoAbierto Database Setup"
echo "============================="
echo ""
echo "📋 MANUAL STEPS REQUIRED BEFORE RUNNING THIS SCRIPT:"
echo "   1. Go to https://supabase.com → your project → SQL Editor"
echo "   2. Paste and run: supabase/migrations/001_initial.sql"
echo "   3. Paste and run: supabase/migrations/002_indexes_and_rls.sql"
echo "   4. Then press ENTER below to seed data"
echo ""
echo "Press ENTER to continue (or Ctrl+C to cancel)..."
read -r

echo ""
echo "🌱 Running seeder..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
npx tsx "${SCRIPT_DIR}/seed-candidates.ts"

SEED_EXIT_CODE=$?

if [ $SEED_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Seeding failed with exit code $SEED_EXIT_CODE"
  exit $SEED_EXIT_CODE
fi

echo ""
echo "✅ Database ready!"
echo ""
echo "Next steps:"
echo "  1. Verify data in Supabase Dashboard → Table Editor"
echo "  2. Run 'npm run dev' to test locally with real data"
echo "  3. Set env vars in Vercel → Settings → Environment Variables"
