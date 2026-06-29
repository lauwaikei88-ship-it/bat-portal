"""
add_post.py
-----------
USE THIS SCRIPT to add a new post to the scheduling database.

Usage:
  py add_post.py

You will be prompted to enter:
  - The image prompt (what Agnes AI should generate)
  - The caption text (what will appear on Instagram)
  - The scheduled datetime (when to post, e.g. "2026-06-29 09:00")

The post will be saved as 'approved' and the scheduler will automatically
pick it up and post it at the scheduled time.
"""

import json
import os
import time

DB_FILE = os.path.join(os.path.dirname(__file__), "database.json")


def load_db():
    if not os.path.exists(DB_FILE):
        return {"posts": []}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_db(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def add_post(prompt, caption, scheduled_at):
    """
    Adds a post to the database with status 'approved'.

    Args:
        prompt (str): The image generation prompt for Agnes AI.
        caption (str): The caption/text to post on Instagram.
        scheduled_at (str): ISO 8601 datetime string, e.g. "2026-06-29T09:00:00"
    """
    db = load_db()
    post = {
        "id": int(time.time() * 1000),
        "prompt": prompt.strip(),
        "caption": caption.strip(),
        "scheduled_at": scheduled_at.strip(),
        "status": "approved",
        "created_at": __import__("datetime").datetime.now().isoformat()
    }
    db["posts"].append(post)
    save_db(db)
    print(f"\n[OK] Post saved to database.")
    print(f"     Prompt   : {post['prompt']}")
    print(f"     Caption  : {post['caption']}")
    print(f"     Scheduled: {post['scheduled_at']}")
    print(f"     Status   : {post['status']}")
    print(f"\nThe scheduler will automatically post this at the scheduled time.")


if __name__ == "__main__":
    print("=== Add a New Scheduled Post ===\n")

    prompt = input("Image Prompt (what should Agnes generate?):\n> ").strip()
    if not prompt:
        print("Error: Prompt cannot be empty.")
        exit(1)

    caption = input("\nInstagram Caption (text + hashtags):\n> ").strip()
    if not caption:
        print("Error: Caption cannot be empty.")
        exit(1)

    print("\nScheduled Date & Time (format: YYYY-MM-DD HH:MM, e.g. 2026-06-29 09:00)")
    scheduled_str = input("> ").strip()
    if not scheduled_str:
        print("Error: Scheduled time cannot be empty.")
        exit(1)

    # Parse and convert to ISO format
    try:
        from datetime import datetime
        dt = datetime.strptime(scheduled_str, "%Y-%m-%d %H:%M")
        scheduled_iso = dt.isoformat()
    except ValueError:
        print("Error: Invalid date format. Please use YYYY-MM-DD HH:MM")
        exit(1)

    add_post(prompt, caption, scheduled_iso)
