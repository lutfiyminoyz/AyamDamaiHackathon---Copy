# SDOC Hackathon Baseline

This is an offline-first baseline for the SDOC hackathon.

## Run locally

Put these files beside the hackathon bundle:

    loader.py
    main.py
    classifier.py
    document_parser.py
    comparator.py
    pipeline.py

Install dependencies:

    pip install -r requirements.txt

Run against the static bundle (the repository bundle is the default source):

    python main.py --output submission.json

Run against the organizer Docker server:

    python main.py --source http://localhost:8080 --output submission.json --submit

The program prints a summary and, when `--submit` is used, the server scoreboard.

## Architecture

email
 -> classifier
 -> identify SI/BL by attachment filename + document content
 -> parse txt/pdf/docx/xlsx
 -> normalize seven fields
 -> deterministic comparison
 -> exact submission schema

The LLM is intentionally not required for the baseline. This makes the first version
repeatable and easy to debug. An LLM can be added later for ambiguous classification or
document extraction without replacing the deterministic comparison layer.
