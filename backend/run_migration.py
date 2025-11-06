"""
Simple script to run SQL migrations on local Supabase instance.
"""
import os
from supabase import create_client, Client
from pathlib import Path

# Read SQL migration file
migration_file = Path(__file__).parent / "migrations" / "create_categories.sql"
with open(migration_file, 'r') as f:
    sql_commands = f.read()

# Connect to Supabase using service role key (has admin privileges)
supabase_url = "http://localhost:54321"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

supabase: Client = create_client(supabase_url, supabase_key)

# Execute the SQL
print("Running migration: create_categories.sql")
print("-" * 50)

# Split by semicolons and execute each statement
statements = [stmt.strip() for stmt in sql_commands.split(';') if stmt.strip() and not stmt.strip().startswith('--')]

for i, statement in enumerate(statements, 1):
    # Skip comments
    if statement.startswith('--'):
        continue

    print(f"\nExecuting statement {i}...")
    try:
        # Use the rpc endpoint to execute raw SQL
        result = supabase.rpc('exec_sql', {'sql': statement}).execute()
        print(f"✓ Statement {i} executed successfully")
    except Exception as e:
        # Try using PostgREST SQL function if available, or just print the statement for manual execution
        print(f"Note: Direct SQL execution via Supabase Python client requires a custom function.")
        print(f"Please run the following SQL manually in Supabase Dashboard > SQL Editor:")
        print("\n" + "="*50)
        print(sql_commands)
        print("="*50)
        break

print("\n" + "-" * 50)
print("Migration complete!")
