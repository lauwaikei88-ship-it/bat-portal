import os
import time
import requests
import base64
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Load Environment Variables
AGNES_API_KEY = os.environ.get("AGNES_API_KEY")
META_ACCESS_TOKEN = os.environ.get("META_ACCESS_TOKEN")

if not AGNES_API_KEY or not META_ACCESS_TOKEN:
    print("Error: Missing AGNES_API_KEY or META_ACCESS_TOKEN in .env file.")
    exit(1)

# API Endpoints
AGNES_API_BASE_URL = "https://apihub.agnes-ai.com/v1"
META_GRAPH_URL = "https://graph.facebook.com/v19.0"

import json
from datetime import datetime

def get_next_prompt():
    db_file = "database.json"
    
    if not os.path.exists(db_file):
        print(f"Error: {db_file} not found. Please create it via Bat Portal.")
        return None
        
    with open(db_file, "r", encoding="utf-8") as f:
        db = json.load(f)
        
    posts = db.get("posts", [])
    if not posts:
        print("Queue is empty! Add more posts via Bat Portal.")
        return None
        
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Find the first approved post scheduled for today or earlier
    selected_post = None
    for post in posts:
        if post.get("status") == "approved" and post.get("date") <= today_str:
            selected_post = post
            break
            
    if not selected_post:
        print("No approved posts scheduled for today or earlier.")
        return None
        
    current_prompt = selected_post["prompt"]
    
    # Mark as posted
    selected_post["status"] = "posted"
    
    with open(db_file, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
        
    print(f"Loaded approved prompt from queue: {current_prompt}")
    return current_prompt

def get_instagram_account_id():
    """Retrieves the Instagram Professional Account ID from environment variables."""
    ig_id = os.environ.get("IG_ACCOUNT_ID")
    if ig_id:
        print(f"Using Instagram Account ID from environment: {ig_id}")
        return ig_id
    else:
        print("Error: IG_ACCOUNT_ID not found in .env file.")
        return None

def generate_agnes_image(image_prompt):
    """Uses Agnes API to generate the base image."""
    print("Step 1: Generating Image via Agnes...")
    
    headers = {
        "Authorization": f"Bearer {AGNES_API_KEY}",
        "Content-Type": "application/json"
    }
    
    img_payload = {
        "model": "agnes-image-2.1-flash",
        "prompt": image_prompt,
        "n": 1,
        "size": "1024x1024"
    }
    img_resp = requests.post(f"{AGNES_API_BASE_URL}/images/generations", headers=headers, json=img_payload)
    img_data = img_resp.json()
    
    if not img_data.get('data'):
        print("Image generation failed:", img_data)
        return None
        
    image_url = img_data['data'][0]['url']
    print("Step 1 Complete! Image generated.")
    return image_url

def post_to_instagram(ig_account_id, image_url, caption):
    """Uploads and publishes an image to Instagram."""
    print("Step 2: Uploading Image to Instagram...")
    
    # Append some standard hashtags to the caption
    full_caption = caption + "\n\n#TapPayMY #NFC #Business #Tech #Contactless"
    
    # 1. Create Media Container
    container_url = f"{META_GRAPH_URL}/{ig_account_id}/media"
    container_payload = {
        "image_url": image_url,
        "caption": full_caption,
        "access_token": META_ACCESS_TOKEN
    }
    
    container_resp = requests.post(container_url, data=container_payload).json()
    creation_id = container_resp.get("id")
    
    if not creation_id:
        print("Failed to create Instagram media container:", container_resp)
        return
        
    print(f"Container created (ID: {creation_id}). Waiting for Instagram to process image...")
    
    # 2. Wait for Processing
    status_url = f"{META_GRAPH_URL}/{creation_id}?fields=status_code&access_token={META_ACCESS_TOKEN}"
    while True:
        status_resp = requests.get(status_url).json()
        status = status_resp.get("status_code", "").upper()
        
        if status == "FINISHED":
            break
        elif status == "ERROR":
            print("Instagram failed to process the image.")
            return
            
        time.sleep(5)
        
    # 3. Publish Media
    print("Step 3: Publishing to Instagram Feed...")
    publish_url = f"{META_GRAPH_URL}/{ig_account_id}/media_publish"
    publish_payload = {
        "creation_id": creation_id,
        "access_token": META_ACCESS_TOKEN
    }
    
    publish_resp = requests.post(publish_url, data=publish_payload).json()
    
    if "id" in publish_resp:
        print(f"Success! Image published to Instagram. Post ID: {publish_resp['id']}")
    else:
        print("Failed to publish image:", publish_resp)

if __name__ == "__main__":
    print("=== Starting Daily IG Poster ===")
    ig_id = get_instagram_account_id()
    
    if ig_id:
        prompt = get_next_prompt()
        if prompt:
            image_url = generate_agnes_image(prompt)
            if image_url:
                post_to_instagram(ig_id, image_url, prompt)

