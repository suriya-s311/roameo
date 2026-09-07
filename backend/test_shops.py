from supabase import create_client
import os, sys
from dotenv import load_dotenv
load_dotenv()
c = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
r = c.table('shops').select('*, sellers(business_name, udyam_verified)').order('name').range(0, 19).execute()
results = []
for item in r.data:
    seller_info = item.pop('sellers', {})
    item['seller_name'] = seller_info.get('business_name', '') if seller_info else ''
    prod_count = c.table('products').select('id', count='exact').eq('shop_id', item['id']).execute()
    item['product_count'] = prod_count.count or 0
    results.append(item)
    print(f"Shop: {item['name']}, seller_id: {item.get('seller_id')}, product_count: {item['product_count']}")

# Now test Pydantic
from app.schemas.models import ShopResponse
for shop_data in results:
    try:
        shop = ShopResponse(**shop_data)
        print(f'Pydantic OK: {shop.name}')
    except Exception as e:
        print(f'Pydantic ERROR for {shop_data.get("name")}: {e}')
