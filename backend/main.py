#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

from app.loader import Inbox
from app.pipeline import process_inbox

def main():
    parser = argparse.ArgumentParser()
    default_source = Path(__file__).resolve().parent.parent / "data" / "sdoc-hackathon-bundle"
    parser.add_argument("--source", default=str(default_source),
                        help="Static bundle path or http://localhost:8080")
    parser.add_argument("--output", default="submission.json")
    parser.add_argument("--submit", action="store_true",
                        help="Submit to the HTTP server and print scoreboard")
    args = parser.parse_args()

    inbox = Inbox(args.source)
    submission = process_inbox(inbox)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(submission, f, indent=2)

    from collections import Counter
    cats = Counter(v["category"] for v in submission.values())
    statuses = Counter(v["status"] for v in submission.values())

    print(f"Generated {len(submission)} email results")
    print("Categories:", dict(cats))
    print("Statuses:", dict(statuses))
    print(f"Saved: {args.output}")

    if args.submit:
        if not inbox.is_http:
            raise SystemExit("--submit requires an HTTP source")
        result = inbox.submit(submission)
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
