#!/usr/bin/env python3
"""
Test script for Supabase Python SDK connection.

Usage:
    python3 test_supabase_sdk.py

Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client


def test_supabase_connection():
    """Test connection to Supabase using the Python SDK."""

    print("=" * 60)
    print("Supabase SDK Connection Test")
    print("=" * 60)

    # Load environment variables
    env_files = ['.env', '.env.local', '.env.production']
    for env_file in env_files:
        if os.path.exists(env_file):
            print(f"\nLoading environment from: {env_file}")
            load_dotenv(env_file, override=True)
            break
    else:
        print("\n⚠️  No .env file found, using environment variables")

    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("\n✗ Error: Missing Supabase configuration")
        print("\nPlease set the following environment variables:")
        print("  SUPABASE_URL=https://your-project.supabase.co")
        print("  SUPABASE_ANON_KEY=your-anon-key")
        print("\nYou can find these in your Supabase dashboard:")
        print("  Settings → API → Project URL and API Keys\n")
        sys.exit(1)

    print(f"\nSupabase URL: {supabase_url}")
    print(f"API Key: {supabase_key[:20]}...{supabase_key[-10:]}\n")

    try:
        # Create Supabase client
        print("1. Creating Supabase client...")
        supabase: Client = create_client(supabase_url, supabase_key)
        print("   ✓ Client created successfully\n")

        # Test connection by listing tables
        print("2. Testing connection...")
        # Simple health check - try to query the goals table
        response = supabase.table("goals").select("*").limit(1).execute()
        print(f"   ✓ Connection successful!\n")

        # Count goals
        print("3. Counting goals in database...")
        response = supabase.table("goals").select("*", count="exact").execute()
        count = response.count if hasattr(response, 'count') else len(response.data)
        print(f"   ✓ Found {count} goal(s) in database\n")

        # Show sample data if available
        if response.data:
            print("4. Sample goal data:")
            sample = response.data[0]
            print(f"   ID: {sample.get('id')}")
            print(f"   Title: {sample.get('title')}")
            print(f"   Status: {sample.get('status')}")
            print(f"   Created: {sample.get('created_at')}\n")

        print("=" * 60)
        print("✓ All tests passed! Supabase SDK is working correctly.")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"\n✗ Connection failed!")
        print(f"\nError type: {type(e).__name__}")
        print(f"Error message: {str(e)}\n")
        print("=" * 60)
        print("Common issues:")
        print("  • Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct")
        print("  • Verify your Supabase project is active")
        print("  • Ensure the 'goals' table exists in your database")
        print("  • Check that Row Level Security (RLS) policies allow access")
        print("=" * 60)
        return False


if __name__ == "__main__":
    result = test_supabase_connection()
    sys.exit(0 if result else 1)
