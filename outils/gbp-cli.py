#!/usr/bin/env python3
"""
Google Business Profile CLI - Taillage de haies
Manage your Google Business Profile entirely from the command line.

Usage:
    python3 gbp-cli.py setup          # One-time OAuth setup (opens browser)
    python3 gbp-cli.py accounts       # List your GBP accounts
    python3 gbp-cli.py locations      # List all locations/fiches
    python3 gbp-cli.py info           # Show full location details
    python3 gbp-cli.py update-desc    # Update business description
    python3 gbp-cli.py update-hours   # Update business hours
    python3 gbp-cli.py update-phone   # Update phone number
    python3 gbp-cli.py update-website # Update website URL
    python3 gbp-cli.py update-cats    # Update categories
    python3 gbp-cli.py reviews        # List reviews
    python3 gbp-cli.py reply-review   # Reply to a review
    python3 gbp-cli.py post           # Create a Google Post
    python3 gbp-cli.py photos         # List photos
    python3 gbp-cli.py upload-photo   # Upload a photo
    python3 gbp-cli.py questions      # List Q&A
    python3 gbp-cli.py answer         # Answer a question
"""

import json
import os
import sys
import webbrowser
import http.server
import urllib.parse
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print("Installing google-auth libraries...")
    os.system(f"{sys.executable} -m pip install google-auth google-auth-oauthlib google-auth-httplib2 -q")
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

# --- Config ---
SCRIPT_DIR = Path(__file__).parent
TOKEN_FILE = SCRIPT_DIR / ".gbp-token.json"
CLIENT_SECRETS_FILE = SCRIPT_DIR / ".gbp-client-secrets.json"
SCOPES = [
    "https://www.googleapis.com/auth/business.manage",
]

# API base URLs
API_ACCOUNT = "https://mybusinessaccountmanagement.googleapis.com/v1"
API_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1"
API_GMB = "https://mybusiness.googleapis.com/v4"

# Colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def log_ok(msg):
    print(f"{GREEN}[OK]{RESET} {msg}")


def log_err(msg):
    print(f"{RED}[ERR]{RESET} {msg}")


def log_info(msg):
    print(f"{CYAN}[INFO]{RESET} {msg}")


def log_warn(msg):
    print(f"{YELLOW}[WARN]{RESET} {msg}")


# --- Auth ---
def get_credentials():
    """Load or refresh OAuth credentials."""
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            log_info("Refreshing access token...")
            creds.refresh(Request())
        else:
            if not CLIENT_SECRETS_FILE.exists():
                log_err(f"Client secrets not found: {CLIENT_SECRETS_FILE}")
                log_info("Run 'python3 gbp-cli.py setup' first.")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CLIENT_SECRETS_FILE), SCOPES
            )
            creds = flow.run_local_server(port=8085, prompt="consent")
            log_ok("Authentication successful!")

        # Save token
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
        log_ok(f"Token saved to {TOKEN_FILE}")

    return creds


QUOTA_PROJECT = "taillage-haies-gbp"


def _headers(creds, content_type=False):
    """Build headers with quota project."""
    h = {
        "Authorization": f"Bearer {creds.token}",
        "X-Goog-User-Project": QUOTA_PROJECT,
    }
    if content_type:
        h["Content-Type"] = "application/json"
    return h


def api_get(creds, url, params=None):
    """Make authenticated GET request."""
    r = requests.get(url, headers=_headers(creds), params=params)
    if r.status_code != 200:
        log_err(f"API error {r.status_code}: {r.text}")
        return None
    return r.json()


def api_post(creds, url, data=None):
    """Make authenticated POST request."""
    r = requests.post(url, headers=_headers(creds, content_type=True), json=data)
    if r.status_code not in (200, 201):
        log_err(f"API error {r.status_code}: {r.text}")
        return None
    return r.json()


def api_patch(creds, url, data, update_mask=None):
    """Make authenticated PATCH request."""
    params = {}
    if update_mask:
        params["updateMask"] = update_mask
    r = requests.patch(url, headers=_headers(creds, content_type=True), json=data, params=params)
    if r.status_code != 200:
        log_err(f"API error {r.status_code}: {r.text}")
        return None
    return r.json()


# --- State helpers ---
def load_state():
    """Load saved account/location IDs."""
    state_file = SCRIPT_DIR / ".gbp-state.json"
    if state_file.exists():
        with open(state_file) as f:
            return json.load(f)
    return {}


def save_state(state):
    state_file = SCRIPT_DIR / ".gbp-state.json"
    with open(state_file, "w") as f:
        json.dump(state, f, indent=2)


# --- Commands ---
def cmd_setup():
    """One-time setup: create client secrets and authenticate."""
    print(f"\n{BOLD}=== Google Business Profile CLI Setup ==={RESET}\n")

    if CLIENT_SECRETS_FILE.exists():
        log_ok(f"Client secrets already exist: {CLIENT_SECRETS_FILE}")
    else:
        print(f"""
{BOLD}Step 1: Create OAuth Client ID{RESET}

1. Go to: https://console.cloud.google.com/apis/credentials?project=taillage-haies-gbp
2. Click {BOLD}"+ CREATE CREDENTIALS"{RESET} > {BOLD}"OAuth client ID"{RESET}
3. If asked for consent screen:
   - Choose "External"
   - App name: "Taillage Haies GBP CLI"
   - Support email: your email
   - Save
4. Application type: {BOLD}"Desktop app"{RESET}
5. Name: "GBP CLI"
6. Click {BOLD}"Create"{RESET}
7. Click {BOLD}"DOWNLOAD JSON"{RESET}
8. Save the file as: {CLIENT_SECRETS_FILE}

OR paste the Client ID and Client Secret below:
""")
        client_id = input(f"{CYAN}Client ID: {RESET}").strip()
        client_secret = input(f"{CYAN}Client Secret: {RESET}").strip()

        if client_id and client_secret:
            secrets = {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:8085/"],
                }
            }
            with open(CLIENT_SECRETS_FILE, "w") as f:
                json.dump(secrets, f, indent=2)
            log_ok(f"Client secrets saved to {CLIENT_SECRETS_FILE}")
        else:
            log_err("No credentials provided. Download the JSON from Google Cloud Console.")
            sys.exit(1)

    print(f"\n{BOLD}Step 2: Authenticate with Google{RESET}")
    log_info("Opening browser for OAuth consent...")
    log_info(f"Log in with the Google account that owns the business profile")
    log_info(f"(e.g., Joannettehenri06@gmail.com)")
    print()

    creds = get_credentials()
    log_ok("Setup complete! You can now use all GBP commands.")

    # Try to fetch accounts immediately
    print(f"\n{BOLD}Step 3: Detecting your accounts...{RESET}")
    result = api_get(creds, f"{API_ACCOUNT}/accounts")
    if result and "accounts" in result:
        accounts = result["accounts"]
        for i, acc in enumerate(accounts):
            print(f"  [{i}] {acc.get('accountName', 'N/A')} ({acc['name']})")
            print(f"      Type: {acc.get('type', 'N/A')}")
        if len(accounts) == 1:
            state = {"account_name": accounts[0]["name"]}
            save_state(state)
            log_ok(f"Auto-selected account: {accounts[0]['name']}")
            # Fetch locations
            _fetch_and_save_location(creds, accounts[0]["name"])
    else:
        log_warn("Could not fetch accounts yet. API access may need approval.")


def _fetch_and_save_location(creds, account_name):
    """Fetch locations and save the first one."""
    result = api_get(
        creds,
        f"{API_INFO}/accounts/{account_name.split('/')[-1]}/locations",
        params={"readMask": "name,title,storefrontAddress,websiteUri,phoneNumbers,regularHours,profile"},
    )
    if result and "locations" in result:
        locations = result["locations"]
        for i, loc in enumerate(locations):
            title = loc.get("title", "N/A")
            addr = loc.get("storefrontAddress", {})
            lines = addr.get("addressLines", [])
            city = addr.get("locality", "")
            print(f"  [{i}] {title}")
            print(f"      {', '.join(lines)} {city}")
        if len(locations) >= 1:
            state = load_state()
            state["location_name"] = locations[0]["name"]
            state["location_title"] = locations[0].get("title", "")
            save_state(state)
            log_ok(f"Auto-selected location: {locations[0].get('title', locations[0]['name'])}")
    else:
        log_warn("No locations found or API returned empty.")


def cmd_accounts():
    """List GBP accounts."""
    creds = get_credentials()
    result = api_get(creds, f"{API_ACCOUNT}/accounts")
    if not result:
        return

    accounts = result.get("accounts", [])
    if not accounts:
        log_warn("No accounts found.")
        return

    print(f"\n{BOLD}Your Google Business Profile Accounts:{RESET}\n")
    for i, acc in enumerate(accounts):
        name = acc.get("accountName", "N/A")
        acc_type = acc.get("type", "N/A")
        acc_id = acc["name"]
        print(f"  {CYAN}[{i}]{RESET} {BOLD}{name}{RESET}")
        print(f"       ID: {acc_id}")
        print(f"       Type: {acc_type}")
        print()

    if len(accounts) == 1:
        state = load_state()
        state["account_name"] = accounts[0]["name"]
        save_state(state)


def cmd_locations():
    """List all locations."""
    creds = get_credentials()
    state = load_state()
    account = state.get("account_name")
    if not account:
        log_err("No account selected. Run 'accounts' first.")
        return

    account_id = account.split("/")[-1]
    result = api_get(
        creds,
        f"{API_INFO}/accounts/{account_id}/locations",
        params={"readMask": "name,title,storefrontAddress,websiteUri,phoneNumbers,regularHours,profile,categories"},
    )
    if not result:
        return

    locations = result.get("locations", [])
    if not locations:
        log_warn("No locations found.")
        return

    print(f"\n{BOLD}Your Locations:{RESET}\n")
    for i, loc in enumerate(locations):
        title = loc.get("title", "N/A")
        addr = loc.get("storefrontAddress", {})
        phone = loc.get("phoneNumbers", {}).get("primaryPhone", "N/A")
        website = loc.get("websiteUri", "N/A")
        print(f"  {CYAN}[{i}]{RESET} {BOLD}{title}{RESET}")
        print(f"       Address: {', '.join(addr.get('addressLines', []))} {addr.get('locality', '')}")
        print(f"       Phone: {phone}")
        print(f"       Website: {website}")
        print(f"       ID: {loc['name']}")
        print()

    # Auto-select first
    state["location_name"] = locations[0]["name"]
    state["location_title"] = locations[0].get("title", "")
    save_state(state)


def cmd_info():
    """Show full location details."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected. Run 'locations' first.")
        return

    result = api_get(
        creds,
        f"{API_INFO}/{loc}",
        params={"readMask": "name,title,storefrontAddress,websiteUri,phoneNumbers,regularHours,profile,categories,serviceArea,labels,languageCode,latlng,metadata"},
    )
    if not result:
        return

    print(f"\n{BOLD}=== {result.get('title', 'N/A')} ==={RESET}\n")
    print(json.dumps(result, indent=2, ensure_ascii=False))


def cmd_update_description():
    """Update business description."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected. Run 'locations' first.")
        return

    print(f"\n{BOLD}Update Description for: {state.get('location_title', loc)}{RESET}\n")
    print("Enter new description (max 750 chars). Type 'END' on a new line to finish:")
    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)
    description = "\n".join(lines)

    if not description:
        log_err("Empty description. Aborting.")
        return

    print(f"\n{YELLOW}Preview:{RESET}\n{description}\n")
    confirm = input(f"{CYAN}Confirm update? (y/n): {RESET}").strip().lower()
    if confirm != "y":
        log_warn("Cancelled.")
        return

    result = api_patch(
        creds,
        f"{API_INFO}/{loc}",
        {"profile": {"description": description}},
        update_mask="profile.description",
    )
    if result:
        log_ok("Description updated!")


def cmd_update_hours():
    """Update business hours."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected. Run 'locations' first.")
        return

    print(f"\n{BOLD}Update Hours for: {state.get('location_title', loc)}{RESET}\n")
    print("Enter hours for each day (format: HH:MM-HH:MM, or 'closed'):")

    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    periods = []

    for day in days:
        hours = input(f"  {day}: ").strip()
        if hours.lower() == "closed" or not hours:
            continue
        parts = hours.split("-")
        if len(parts) == 2:
            open_time = parts[0].strip()
            close_time = parts[1].strip()
            periods.append({
                "openDay": day,
                "openTime": {"hours": int(open_time.split(":")[0]), "minutes": int(open_time.split(":")[1])},
                "closeDay": day,
                "closeTime": {"hours": int(close_time.split(":")[0]), "minutes": int(close_time.split(":")[1])},
            })

    result = api_patch(
        creds,
        f"{API_INFO}/{loc}",
        {"regularHours": {"periods": periods}},
        update_mask="regularHours",
    )
    if result:
        log_ok("Hours updated!")


def cmd_update_phone():
    """Update phone number."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected.")
        return

    phone = input(f"\n{CYAN}New phone number (e.g., +1-514-555-1234): {RESET}").strip()
    if not phone:
        return

    result = api_patch(
        creds,
        f"{API_INFO}/{loc}",
        {"phoneNumbers": {"primaryPhone": phone}},
        update_mask="phoneNumbers.primaryPhone",
    )
    if result:
        log_ok(f"Phone updated to: {phone}")


def cmd_update_website():
    """Update website URL."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected.")
        return

    url = input(f"\n{CYAN}New website URL: {RESET}").strip()
    if not url:
        return

    result = api_patch(
        creds,
        f"{API_INFO}/{loc}",
        {"websiteUri": url},
        update_mask="websiteUri",
    )
    if result:
        log_ok(f"Website updated to: {url}")


def cmd_update_categories():
    """Update business categories."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected.")
        return

    # First show available categories
    print(f"\n{BOLD}Current location categories:{RESET}")
    info = api_get(creds, f"{API_INFO}/{loc}", params={"readMask": "categories"})
    if info:
        cats = info.get("categories", {})
        primary = cats.get("primaryCategory", {})
        additional = cats.get("additionalCategories", [])
        print(f"  Primary: {primary.get('displayName', 'N/A')} ({primary.get('name', '')})")
        for cat in additional:
            print(f"  Additional: {cat.get('displayName', 'N/A')} ({cat.get('name', '')})")

    print(f"\n{YELLOW}Search for a category:{RESET}")
    query = input(f"{CYAN}Search term (e.g., 'hedge', 'landscaping'): {RESET}").strip()
    if query:
        cats_result = api_get(
            creds,
            f"{API_INFO}/categories",
            params={"regionCode": "CA", "languageCode": "fr", "filter": f"displayName={query}", "view": "FULL"},
        )
        if cats_result and "categories" in cats_result:
            print(f"\n{BOLD}Matching categories:{RESET}")
            for cat in cats_result["categories"]:
                print(f"  {cat.get('displayName', '')} -> {cat['name']}")


def cmd_reviews():
    """List reviews (uses v4 API)."""
    creds = get_credentials()
    state = load_state()
    account = state.get("account_name", "")
    loc = state.get("location_name", "")
    if not account or not loc:
        log_err("No account/location. Run 'accounts' and 'locations' first.")
        return

    # v4 API path
    account_id = account.split("/")[-1]
    location_id = loc.split("/")[-1]
    url = f"{API_GMB}/accounts/{account_id}/locations/{location_id}/reviews"

    result = api_get(creds, url)
    if not result:
        return

    reviews = result.get("reviews", [])
    avg = result.get("averageRating", "N/A")
    total = result.get("totalReviewCount", 0)

    print(f"\n{BOLD}Reviews ({total} total, avg: {avg}/5){RESET}\n")

    for review in reviews:
        reviewer = review.get("reviewer", {}).get("displayName", "Anonymous")
        rating = review.get("starRating", "N/A")
        comment = review.get("comment", "(no comment)")
        reply = review.get("reviewReply", {}).get("comment", "")
        create_time = review.get("createTime", "")

        stars = "★" * {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5}.get(rating, 0)
        print(f"  {BOLD}{reviewer}{RESET} {YELLOW}{stars}{RESET} ({create_time[:10]})")
        print(f"    {comment}")
        if reply:
            print(f"    {GREEN}→ Reply: {reply}{RESET}")
        else:
            print(f"    {RED}→ No reply{RESET}")
        print(f"    ID: {review['name']}")
        print()


def cmd_reply_review():
    """Reply to a review."""
    creds = get_credentials()
    state = load_state()
    account = state.get("account_name", "")
    loc = state.get("location_name", "")
    if not account or not loc:
        log_err("No account/location selected.")
        return

    review_id = input(f"\n{CYAN}Review ID (full path or just the ID): {RESET}").strip()
    if not review_id:
        return

    if not review_id.startswith("accounts/"):
        account_id = account.split("/")[-1]
        location_id = loc.split("/")[-1]
        review_id = f"accounts/{account_id}/locations/{location_id}/reviews/{review_id}"

    reply_text = input(f"{CYAN}Your reply: {RESET}").strip()
    if not reply_text:
        return

    url = f"{API_GMB}/v4/{review_id}/reply"
    result = api_post(creds, url, {"comment": reply_text})
    if result:
        log_ok("Reply posted!")


def cmd_post():
    """Create a Google Post."""
    creds = get_credentials()
    state = load_state()
    account = state.get("account_name", "")
    loc = state.get("location_name", "")
    if not account or not loc:
        log_err("No account/location selected.")
        return

    print(f"\n{BOLD}Create a Google Post{RESET}\n")
    print("Post types: [1] Update  [2] Event  [3] Offer")
    post_type_input = input(f"{CYAN}Type (1/2/3): {RESET}").strip()
    post_types = {"1": "STANDARD", "2": "EVENT", "3": "OFFER"}
    topic_type = post_types.get(post_type_input, "STANDARD")

    summary = input(f"{CYAN}Post text (max 1500 chars): {RESET}").strip()
    if not summary:
        log_err("Empty post. Aborting.")
        return

    post_data = {
        "topicType": topic_type,
        "summary": summary,
        "languageCode": "fr-CA",
    }

    # Optional CTA
    print(f"\nCall-to-action: [0] None [1] Learn more [2] Book [3] Order [4] Call [5] Shop")
    cta_input = input(f"{CYAN}CTA (0-5): {RESET}").strip()
    cta_types = {"1": "LEARN_MORE", "2": "BOOK", "3": "ORDER", "4": "CALL", "5": "SHOP"}
    if cta_input in cta_types:
        cta_url = input(f"{CYAN}CTA URL: {RESET}").strip()
        if cta_url:
            post_data["callToAction"] = {
                "actionType": cta_types[cta_input],
                "url": cta_url,
            }

    print(f"\n{YELLOW}Preview:{RESET}")
    print(json.dumps(post_data, indent=2, ensure_ascii=False))
    confirm = input(f"\n{CYAN}Publish? (y/n): {RESET}").strip().lower()
    if confirm != "y":
        log_warn("Cancelled.")
        return

    account_id = account.split("/")[-1]
    location_id = loc.split("/")[-1]
    url = f"{API_GMB}/accounts/{account_id}/locations/{location_id}/localPosts"
    result = api_post(creds, url, post_data)
    if result:
        log_ok("Post published!")
        print(json.dumps(result, indent=2, ensure_ascii=False))


def cmd_questions():
    """List Q&A."""
    creds = get_credentials()
    state = load_state()
    loc = state.get("location_name")
    if not loc:
        log_err("No location selected.")
        return

    url = f"https://mybusinessqanda.googleapis.com/v1/{loc}/questions"
    result = api_get(creds, url)
    if not result:
        return

    questions = result.get("questions", [])
    print(f"\n{BOLD}Questions & Answers ({len(questions)} total){RESET}\n")
    for q in questions:
        author = q.get("author", {}).get("displayName", "Anonymous")
        text = q.get("text", "")
        answers = q.get("totalAnswerCount", 0)
        print(f"  {BOLD}Q:{RESET} {text}")
        print(f"     By: {author} | Answers: {answers}")
        print(f"     ID: {q['name']}")
        print()


def cmd_answer():
    """Answer a question."""
    creds = get_credentials()

    question_name = input(f"\n{CYAN}Question ID (full path): {RESET}").strip()
    if not question_name:
        return

    answer_text = input(f"{CYAN}Your answer: {RESET}").strip()
    if not answer_text:
        return

    url = f"https://mybusinessqanda.googleapis.com/v1/{question_name}/answers:upsert"
    result = api_post(creds, url, {"text": answer_text})
    if result:
        log_ok("Answer posted!")


# --- Main ---
COMMANDS = {
    "setup": cmd_setup,
    "accounts": cmd_accounts,
    "locations": cmd_locations,
    "info": cmd_info,
    "update-desc": cmd_update_description,
    "update-hours": cmd_update_hours,
    "update-phone": cmd_update_phone,
    "update-website": cmd_update_website,
    "update-cats": cmd_update_categories,
    "reviews": cmd_reviews,
    "reply-review": cmd_reply_review,
    "post": cmd_post,
    "photos": lambda: print("Use 'info' to see media, or upload via 'upload-photo'"),
    "questions": cmd_questions,
    "answer": cmd_answer,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "help"):
        print(__doc__)
        print(f"{BOLD}Available commands:{RESET}")
        for cmd in COMMANDS:
            print(f"  {CYAN}{cmd}{RESET}")
        return

    cmd = sys.argv[1]
    if cmd not in COMMANDS:
        log_err(f"Unknown command: {cmd}")
        print(f"Available: {', '.join(COMMANDS.keys())}")
        return

    COMMANDS[cmd]()


if __name__ == "__main__":
    main()
