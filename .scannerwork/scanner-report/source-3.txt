from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(
    supabase_url=os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""),
    supabase_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
)
