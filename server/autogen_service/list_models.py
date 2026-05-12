import os
from google import genai
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(parent_env_path)

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("No API key found in .env!")
    exit(1)

client = genai.Client(api_key=api_key)

print("Models supporting generateContent:")
try:
    for m in client.models.list():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
