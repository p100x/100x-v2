import os
from supabase import create_client, Client
from datetime import datetime, timedelta

supabase_url = 'https://jfhelnsdfzbwwrmbuoms.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY1NzQ1MywiZXhwIjoyMDQyMjMzNDUzfQ.8J5aPGA_6EbLjN2d5bfxNdSi6m23MVQCF0xO6RHy1JA'

supabase: Client = create_client(supabase_url, supabase_key)

def sync_users_to_subscriptions():
    try:
        # Fetch all users from auth.users, handling pagination
        all_users = []
        page = 1
        while True:
            users = supabase.auth.admin.list_users(page=page, per_page=1000)
            if not users:
                break
            all_users.extend(users)
            page += 1

        if not all_users:
            print("No users found.")
            return

        print(f"Found {len(all_users)} users to sync.")

        # Prepare subscription data for all users
        subscription_data = [
            {
                "user_id": user.id,
                "subscription_status": "active",
                "subscription_type": "default",
                "start_date": datetime.now().isoformat(),
                "end_date": (datetime.now() + timedelta(days=365)).isoformat()
            }
            for user in all_users
        ]

        # Insert subscription data into user_subscriptions table
        response = supabase.table('user_subscriptions').upsert(subscription_data).execute()
        inserted_data = response.data

        print(f"Successfully synced {len(inserted_data)} user subscriptions.")
    except Exception as error:
        import traceback
        print('Error during sync:', str(error))
        print('Traceback:')
        print(traceback.format_exc())

# Run the sync function
if __name__ == "__main__":
    sync_users_to_subscriptions()