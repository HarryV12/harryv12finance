"""Connects @RealFinancev12 to x_posts.py. Run this once, by hand, in a terminal on the PC. It posts nothing.

The app belongs to the main developer account, so @RealFinancev12 has to approve it once (X's PIN flow), which gives
that account its own access token. This asks for the app's API Key and Secret without showing them, opens X so you can
log in as @RealFinancev12 and approve, and saves all four keys as GitHub secrets. They are never printed or written to a
file. If the account that approved isn't @RealFinancev12, it stops and saves nothing.

Run it again if the keys ever need replacing. Revoking the app in the account's settings cancels them.
"""
import getpass
import shutil
import subprocess
import sys
import webbrowser
from pathlib import Path

from requests_oauthlib import OAuth1Session

ACCOUNT = "RealFinancev12"  # the same as X_ACCOUNT in x_posts.py
REPO = "HarryV12/harryv12finance"
API = "https://api.x.com"


def find_gh():
    gh = shutil.which("gh") or "C:/Program Files/GitHub CLI/gh.exe"
    if not Path(gh).exists():
        sys.exit("GitHub CLI (gh) wasn't found, so the keys couldn't be saved. Nothing has changed.")
    if subprocess.run([gh, "auth", "status"], capture_output=True).returncode != 0:
        sys.exit("GitHub CLI isn't signed in here. Run: gh auth login   Nothing has changed.")
    return gh


def main():
    gh = find_gh()  # before asking for anything, so a problem here wastes nobody's time
    print(f"\nThis connects @{ACCOUNT} so the job can post to it later. It posts nothing now.\n")
    print("Paste each key and press Enter. Nothing shows on screen as you paste: that's normal.")
    key = getpass.getpass("App API Key: ").strip()
    secret = getpass.getpass("App API Key Secret: ").strip()
    if not key or not secret:
        sys.exit("Both are needed. Nothing has changed.")

    app = OAuth1Session(key, client_secret=secret, callback_uri="oob")
    try:
        # write access, whatever the app's default; "oob" is X's PIN mode
        request = app.fetch_request_token(f"{API}/oauth/request_token?x_auth_access_type=write")
    except Exception as e:
        sys.exit(f"X didn't accept that API Key and Secret, or the app's settings need changing: {e}\nNothing has changed.")

    # force_login makes X ask who you are, so the main account can't approve by accident
    url = f"{API}/oauth/authorize?oauth_token={request['oauth_token']}&force_login=true"
    print(f"\nOpening X. Log in as @{ACCOUNT} (not your main account), then click Authorize.")
    print(f"If nothing opens, go to:\n{url}\n")
    webbrowser.open(url)
    pin = input("Type the PIN that X shows you, then press Enter: ").strip()

    try:
        got = OAuth1Session(key, client_secret=secret, resource_owner_key=request["oauth_token"],
                            resource_owner_secret=request["oauth_token_secret"], verifier=pin).fetch_access_token(f"{API}/oauth/access_token")
    except Exception as e:
        sys.exit(f"X didn't accept that PIN: {e}\nRun this again to get a new one. Nothing has changed.")
    token, token_secret = got["oauth_token"], got["oauth_token_secret"]

    # X's reference says the answer names the account; its guide doesn't, so ask if it's missing
    who = got.get("screen_name")
    if not who:
        me = OAuth1Session(key, client_secret=secret, resource_owner_key=token, resource_owner_secret=token_secret).get(f"{API}/2/users/me", timeout=60)
        if not me.ok:
            sys.exit(f"Couldn't check which account approved ({me.status_code}). Nothing has been saved.")
        who = me.json()["data"]["username"]
    if who.lower() != ACCOUNT.lower():
        sys.exit(f"\nThat was @{who}, not @{ACCOUNT}, so nothing has been saved. Run this again and log in as @{ACCOUNT}.\n"
                 f"(You can remove the approval in @{who}'s settings: Security and account access, Apps and sessions, Connected apps.)")

    for name, value in [("X_API_KEY", key), ("X_API_SECRET", secret), ("X_ACCESS_TOKEN", token), ("X_ACCESS_SECRET", token_secret)]:
        # through stdin, so the keys never appear in a command line
        done = subprocess.run([gh, "secret", "set", name, "--repo", REPO], input=value, text=True, capture_output=True)
        if done.returncode != 0:
            sys.exit(f"GitHub didn't save {name}. Run this again to finish. {done.stderr.strip()}")
        print(f"saved {name}")

    print(f"\nDone: @{ACCOUNT} is connected. Nothing has been posted, and nothing will be until the job is switched to live.")


if __name__ == "__main__":
    main()
