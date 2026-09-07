from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()

c = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# Check all products and their shop_id
r = c.table('products').select('id, name, seller_id, shop_id').execute()
print(f'Total products: {len(r.data)}')
for p in r.data:
    print(f'  {p["name"][:45]:45s} seller_id={str(p["seller_id"])[:8]:8s} shop_id={str(p["shop_id"])[:8]:8s}')
