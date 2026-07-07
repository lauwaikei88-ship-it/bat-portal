import os
import time
import base64
import requests
import json

# Try to load dotenv, fallback to manual parse if not installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    os.environ[key] = val

AGNES_API_KEY = os.environ.get("AGNES_API_KEY")
if not AGNES_API_KEY:
    print("Error: AGNES_API_KEY not found in .env")
    exit(1)

API_BASE_URL = "https://apihub.agnes-ai.com/v1"
INPUT_DIR = "input_images"
OUTPUT_DIR = "output_videos"
TEMP_DIR = "temp_images"

# Create directories if they don't exist
for d in [INPUT_DIR, OUTPUT_DIR, TEMP_DIR]:
    os.makedirs(d, exist_ok=True)

# Prompts
IMAGE_PROMPT = "A luxurious product photography shot. The product is placed on a pristine white marble slab. In the background, there is a gentle, elegant waterfall with crystal clear water. High-end lighting, soft shadows, 8k resolution, photorealistic."
VIDEO_PROMPT = "The background water flows gently. The camera slowly pushes in towards the product. Cinematic dynamic lighting, high definition, smooth motion."

headers = {
    "Authorization": f"Bearer {AGNES_API_KEY}",
    "Content-Type": "application/json"
}

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def generate_background_image(image_path, filename):
    print(f"[{filename}] Step 1: Generating high-end background...")
    base64_image = encode_image_to_base64(image_path)
    
    # Check extension to determine mime type
    ext = os.path.splitext(image_path)[1].lower().replace('.', '')
    mime_type = f"image/{ext}" if ext in ['png', 'jpeg', 'jpg', 'webp'] else "image/jpeg"
    image_data_url = f"data:{mime_type};base64,{base64_image}"

    payload = {
        "model": "agnes-image-2.1-flash",
        "prompt": IMAGE_PROMPT,
        # Some APIs use 'image' or 'init_image' for image-to-image
        "image": image_data_url, 
        "n": 1,
        "size": "1024x1024"
    }

    response = requests.post(f"{API_BASE_URL}/images/generations", headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and len(data['data']) > 0:
            new_image_url = data['data'][0]['url']
            print(f"[{filename}] Step 1 Success: Image generated. Downloading temp image...")
            
            # Download the temp image for the next step
            img_resp = requests.get(new_image_url)
            temp_path = os.path.join(TEMP_DIR, f"bg_{filename}")
            with open(temp_path, 'wb') as f:
                f.write(img_resp.content)
                
            return temp_path, new_image_url
    
    print(f"[{filename}] Error generating background: {response.text}")
    return None, None

def generate_video(image_url, filename):
    print(f"[{filename}] Step 2: Initiating video generation task...")
    
    payload = {
        "model": "agnes-video-v2.0",
        "prompt": VIDEO_PROMPT,
        "image_url": image_url # Assuming the video API takes an image_url parameter
    }

    response = requests.post(f"{API_BASE_URL}/videos", headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        task_id = data.get("id") or data.get("task_id")
        if task_id:
            print(f"[{filename}] Step 2 Success: Video task created (ID: {task_id}).")
            return task_id
            
    print(f"[{filename}] Error initiating video: {response.text}")
    return None

def poll_and_download_video(task_id, filename):
    print(f"[{filename}] Step 3: Polling for video completion...")
    
    while True:
        try:
            response = requests.get(f"{API_BASE_URL}/videos/{task_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                status = data.get("status", "").lower() or data.get("state", "").lower()
                
                if status in ["completed", "succeeded", "success"]:
                    video_url = data.get("video_url") or (data.get("data") and data["data"][0].get("url")) or data.get("url")
                    if video_url:
                        print(f"[{filename}] Step 3 Success: Video is ready! Downloading...")
                        vid_resp = requests.get(video_url)
                        out_path = os.path.join(OUTPUT_DIR, f"{os.path.splitext(filename)[0]}.mp4")
                        with open(out_path, 'wb') as f:
                            f.write(vid_resp.content)
                        print(f"[{filename}] Done! Saved to {out_path}")
                        return True
                    else:
                        print(f"[{filename}] Video completed but no URL found in response.")
                        return False
                elif status in ["failed", "error"]:
                    print(f"[{filename}] Video generation failed: {data}")
                    return False
                else:
                    print(f"[{filename}] Status: {status}... waiting 10 seconds.")
            else:
                print(f"[{filename}] Error checking status: {response.status_code} {response.text}")
        except Exception as e:
            print(f"[{filename}] Exception during polling: {e}")
        
        time.sleep(10)

def process_batch():
    images = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    if not images:
        print(f"No images found in {INPUT_DIR}/. Please add some product photos.")
        return

    print(f"Found {len(images)} images to process. Starting batch job...")
    
    for filename in images:
        print("-" * 40)
        image_path = os.path.join(INPUT_DIR, filename)
        
        # 1. Generate new background
        temp_path, new_image_url = generate_background_image(image_path, filename)
        if not new_image_url:
            continue
            
        # 2. Initiate video generation
        task_id = generate_video(new_image_url, filename)
        if not task_id:
            continue
            
        # 3. Poll and download
        poll_and_download_video(task_id, filename)

if __name__ == "__main__":
    process_batch()
