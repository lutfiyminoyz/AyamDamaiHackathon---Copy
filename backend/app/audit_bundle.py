"""Quick audit of the supplied bundle before building the final solution."""
import re
from collections import Counter
from loader import Inbox
from classifier import classify
from document_parser import detect_doc_type, read_attachment

inbox = Inbox(".")
emails = list(inbox)

print("Emails:", len(emails))
print("With attachments:", sum(bool(e.get("attachments")) for e in emails))
print("Without attachments:", sum(not e.get("attachments") for e in emails))

print("\nAttachment counts:")
print(Counter(len(e.get("attachments", [])) for e in emails))

types = Counter()
for e in emails:
    for a in e.get("attachments", []):
        try:
            types[detect_doc_type(read_attachment(inbox.read_bytes(a), a))] += 1
        except Exception:
            types["UNREADABLE"] += 1
print("\nDocument content types:")
print(dict(types))

print("\nInitial email categories:")
print(dict(Counter(classify(e) for e in emails)))
