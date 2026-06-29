"""
scheduler.py
------------
This is the CORE AUTOMATION ENGINE for the Bat Portal.

Run this script ONCE and leave it running in the background.
It checks the database every 60 seconds for posts that are:
  - Status: 'approved'
  - Scheduled time <= current time

When it finds a match, it:
  1. Generates the image using Agnes AI
  2. Posts the image + caption to Instagram
  3. Updates the post status to 'published' in the database

HOW TO RUN:
  py scheduler.py

Keep the terminal window open. This is your automation engine.
You can also use Task Scheduler (Windows) to run it on startup.
"""

import os
import json
import time
import requests
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ─── Configuration ────────────────────────────────────────────────────────────

AGNES_API_KEY      = os.environ.get("AGNES_API_KEY")
META_ACCESS_TOKEN  = os.environ.get("META_ACCESS_TOKEN")
IG_ACCOUNT_ID      = os.environ.get("IG_ACCOUNT_ID")

AGNES_BASE_URL     = "https://apihub.agnes-ai.com/v1"
META_GRAPH_URL     = "https://graph.facebook.com/v19.0"
DB_FILE            = os.path.join(os.path.dirname(__file__), "database.json")

CHECK_INTERVAL_SEC = 60  # Check every 60 seconds

# ─── Validation ───────────────────────────────────────────────────────────────

if not AGNES_API_KEY:
    print("[ERROR] AGNES_API_KEY is missing from your .env file. Exiting.")
    exit(1)
if not META_ACCESS_TOKEN:
    print("[ERROR] META_ACCESS_TOKEN is missing from your .env file. Exiting.")
    exit(1)
if not IG_ACCOUNT_ID:
    print("[ERROR] IG_ACCOUNT_ID is missing from your .env file. Exiting.")
    exit(1)

# ─── Database Helpers ─────────────────────────────────────────────────────────

def load_db():
    """Load the post database from disk."""
    if not os.path.exists(DB_FILE):
        return {"posts": []}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_db(db):
    """Save the post database back to disk."""
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def update_post_status(post_id, new_status, extra_fields=None):
    """Find a post by ID and update its status."""
    db = load_db()
    for post in db["posts"]:
        if post["id"] == post_id:
            post["status"] = new_status
            if extra_fields:
                post.update(extra_fields)
            break
    save_db(db)

# ─── Agnes AI: Image Generation ───────────────────────────────────────────────

def generate_image(prompt):
    """
    Call Agnes AI to generate an image from the given prompt.
    Returns the public image URL on success, or None on failure.
    """
    print(f"  [1/3] Generating image via Agnes AI...")
    headers = {
        "Authorization": f"Bearer {AGNES_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
    }
    try:
        resp = requests.post(
            f"{AGNES_BASE_URL}/images/generations",
            headers=headers,
            json=payload,
            timeout=60
        )
        data = resp.json()
        if data.get("data"):
            url = data["data"][0]["url"]
            print(f"  [1/3] Image generated successfully.")
            return url
        else:
            print(f"  [1/3] ERROR: Agnes image generation failed: {data}")
            return None
    except Exception as e:
        print(f"  [1/3] ERROR: Request to Agnes failed: {e}")
        return None

# ─── Meta API: Instagram Posting ──────────────────────────────────────────────

def post_to_instagram(image_url, caption):
    """
    Post the given image URL + caption to Instagram via Meta Graph API.
    Returns the Instagram Post ID on success, or None on failure.

    Flow:
      Step A: Create a media container (image_url + caption)
      Step B: Poll until the container status is FINISHED
      Step C: Publish the container
    """
    # ── Step A: Create Media Container ──
    print(f"  [2/3] Creating Instagram media container...")
    container_resp = requests.post(
        f"{META_GRAPH_URL}/{IG_ACCOUNT_ID}/media",
        data={
            "image_url": image_url,
            "caption": caption,
            "access_token": META_ACCESS_TOKEN
        },
        timeout=30
    ).json()

    creation_id = container_resp.get("id")
    if not creation_id:
        print(f"  [2/3] ERROR: Failed to create container: {container_resp}")
        return None

    print(f"  [2/3] Container created (ID: {creation_id}). Waiting for Instagram to process...")

    # ── Step B: Poll Until FINISHED ──
    for attempt in range(24):  # Poll up to 2 minutes (24 x 5 sec)
        status_resp = requests.get(
            f"{META_GRAPH_URL}/{creation_id}",
            params={"fields": "status_code", "access_token": META_ACCESS_TOKEN},
            timeout=15
        ).json()
        status = status_resp.get("status_code", "").upper()

        if status == "FINISHED":
            print(f"  [2/3] Instagram processing complete.")
            break
        elif status == "ERROR":
            print(f"  [2/3] ERROR: Instagram rejected the image: {status_resp}")
            return None
        else:
            print(f"  [2/3] Status: {status}. Retrying in 5s... ({attempt+1}/24)")
            time.sleep(5)
    else:
        print("  [2/3] ERROR: Timed out waiting for Instagram to process the image.")
        return None

    # ── Step C: Publish ──
    print(f"  [3/3] Publishing to Instagram feed...")
    publish_resp = requests.post(
        f"{META_GRAPH_URL}/{IG_ACCOUNT_ID}/media_publish",
        data={
            "creation_id": creation_id,
            "access_token": META_ACCESS_TOKEN
        },
        timeout=30
    ).json()

    post_id = publish_resp.get("id")
    if post_id:
        print(f"  [3/3] SUCCESS! Post published. Instagram Post ID: {post_id}")
        return post_id
    else:
        print(f"  [3/3] ERROR: Failed to publish: {publish_resp}")
        return None

# ─── Core Logic: Check & Execute Due Posts ────────────────────────────────────

def check_and_execute():
    """
    Load the database, find all approved posts due for posting right now,
    and execute each one sequentially.
    """
    db = load_db()
    posts = db.get("posts", [])
    now = datetime.now()

    due_posts = []
    for post in posts:
        if post.get("status") != "approved":
            continue
        try:
            scheduled = datetime.fromisoformat(post["scheduled_at"])
        except (ValueError, KeyError):
            continue
        if scheduled <= now:
            due_posts.append(post)

    if not due_posts:
        return  # Nothing due, silently return

    print(f"\n[{now.strftime('%Y-%m-%d %H:%M:%S')}] Found {len(due_posts)} post(s) due for publishing.")

    for post in due_posts:
        post_id = post["id"]
        prompt  = post.get("prompt", "")
        caption = post.get("caption", prompt)  # Fall back to prompt if no caption

        print(f"\n--- Processing Post ID {post_id} ---")
        print(f"  Prompt : {prompt}")
        print(f"  Caption: {caption}")
        print(f"  Scheduled: {post['scheduled_at']}")

        # Mark as 'processing' immediately to prevent double-posting on next tick
        update_post_status(post_id, "processing")

        # Step 1: Generate Image
        image_url = generate_image(prompt)
        if not image_url:
            print(f"  FAILED at image generation. Marking as 'error'.")
            update_post_status(post_id, "error", {"error_reason": "Agnes image generation failed"})
            continue

        # Step 2: Post to Instagram
        ig_post_id = post_to_instagram(image_url, caption)
        if ig_post_id:
            update_post_status(post_id, "published", {
                "published_at": datetime.now().isoformat(),
                "ig_post_id": ig_post_id,
                "image_url": image_url
            })
            print(f"  Post ID {post_id} is now PUBLISHED.")
        else:
            update_post_status(post_id, "error", {"error_reason": "Instagram API call failed"})
            print(f"  Post ID {post_id} FAILED. Marked as 'error'.")

# ─── Main Loop ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  Bat Portal Scheduler - RUNNING")
    print(f"  Checking every {CHECK_INTERVAL_SEC} seconds for due posts.")
    print(f"  Database: {DB_FILE}")
    print("  Press Ctrl+C to stop.")
    print("=" * 55)

    while True:
        try:
            check_and_execute()
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Unexpected error in scheduler loop: {e}")

        # Print a heartbeat timestamp every cycle so you know it's alive
        print(f"  [{datetime.now().strftime('%H:%M:%S')}] Scheduler alive. Next check in {CHECK_INTERVAL_SEC}s...", end="\r")
        time.sleep(CHECK_INTERVAL_SEC)
