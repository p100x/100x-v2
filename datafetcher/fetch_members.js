import requests
from tabulate import tabulate

API_URL = 'https://projekt100x.de/wp-json/mp/v1/members'
API_KEY = 'WavOdCGTQN'

def fetch_members(page=1, per_page=100):
    response = requests.get(API_URL, 
                            params={'page': page, 'per_page': per_page},
                            headers={'MEMBERPRESS-API-KEY': API_KEY})
    return response.json()

def display_members_table(members):
    table_data = []
    for member in members:
        active_memberships = ', '.join([m['title'] for m in member['active_memberships']])
        table_data.append([
            member['id'],
            member['email'],
            member['display_name'],
            member['registered_at'],
            active_memberships
        ])
    
    headers = ['ID', 'Email', 'Name', 'Registered At', 'Active Memberships']
    print(tabulate(table_data, headers=headers, tablefmt='grid'))

if __name__ == '__main__':
    members = fetch_members()
    display_members_table(members)