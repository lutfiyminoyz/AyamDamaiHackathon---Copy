# SDOC - Shipping Document Operations Copilot

> AI-powered email triage and Shipping Instruction (SI) ↔ Bill of Lading (BL) verification for shipping and logistics operations.

## 🚢 Overview

SDOC is an AI-assisted shipping inbox system designed to reduce repetitive manual work in logistics operations.

The system processes incoming shipping-related emails, identifies their intent, extracts information from attached documents, compares **Shipping Instructions (SI)** against **draft Bills of Lading (BL)**, and escalates uncertain cases for human review.

Instead of relying entirely on AI, SDOC combines:

**AI document understanding → Deterministic verification → Human-in-the-loop review**

This approach provides a balance between automation, consistency, and operational control.

---

## 🎯 Problem

Shipping teams receive large volumes of emails containing:

* Shipping Instructions
* Draft Bills of Lading
* Invoices
* Supporting documents
* General operational requests
* Spam or irrelevant messages

Manually reviewing these emails and comparing shipping documents can be repetitive and time-consuming.

Important discrepancies can also be difficult to identify when information is spread across different documents.

### SDOC addresses this by automating:

1. Email classification
2. Document identification
3. Document field extraction
4. SI ↔ BL comparison
5. Discrepancy detection
6. Human-review escalation

---

## ✨ Key Features

### 📬 Intelligent Email Triage

Automatically categorizes incoming emails into:

| Category        | Description                           |
| --------------- | ------------------------------------- |
| `BL_COMPARISON` | Emails requiring SI ↔ BL verification |
| `SI_REQUEST`    | Shipping Instruction-related requests |
| `INVOICE_QUERY` | Invoice-related queries               |
| `GENERAL`       | General operational emails            |
| `SPAM`          | Irrelevant or unwanted emails         |

---

### 📄 AI Document Understanding

The system processes shipping attachments and extracts structured information from documents.

Supported document types include:

* Shipping Instructions (SI)
* Bills of Lading (BL)
* Supporting documents

The extraction pipeline uses AI for document understanding while preserving the original documents for human inspection when necessary.

---

### 🔍 SI ↔ BL Comparison

For emails requiring document verification, SDOC compares important shipping fields such as:

* Shipper
* Consignee
* Notify Party
* Port of Loading
* Port of Discharge
* Vessel
* Voyage
* Container
* Booking Number
* Bill of Lading Number

Potential discrepancies are surfaced as specific defect fields instead of simply marking a document as incorrect.

---

### ⚠️ Human-in-the-Loop Review

Not every document should be automatically processed.

SDOC escalates cases such as:

* Missing attachments
* Unreadable documents
* Missing comparison values
* Wrong document types

Original attachments remain available so staff can manually inspect the evidence.

---

### ☁️ Cloud-Ready Architecture

The system is designed around a cloud-ready workflow:

```text
Incoming Emails
       │
       ▼
Email Classification
       │
       ▼
Document Extraction
       │
       ▼
SI / BL Identification
       │
       ▼
Deterministic Comparison
       │
       ├───────────────┐
       ▼               ▼
   Verified       Needs Review
       │               │
       │               ▼
       │        Human Inspection
       │
       └───────┬───────┘
               ▼
          Dashboard
```

---

## 📊 Current Dataset

The current prototype processes:

| Metric                        |  Volume |
| ----------------------------- | ------: |
| Emails                        | **520** |
| Attachments                   | **250** |
| Email categories              |   **5** |
| SI documents                  | **126** |
| BL documents                  | **117** |
| Other / unsupported documents |   **5** |
| Unreadable documents          |   **2** |

These figures describe the current prototype dataset and processing pipeline.

---

## 🏗️ Technology Stack

### AI & Backend

* Python
* FastAPI
* Gemini
* Document extraction pipeline
* Rule-based / deterministic verification

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Database & Storage

* Supabase PostgreSQL
* Supabase Storage

### Deployment

* Vercel
* Cloud-ready backend architecture

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/paleesa/AyamDamaiHackathon.git
cd AyamDamaiHackathon
```

### 2. Backend setup

Create a virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```text
backend/.env
```

Add the required backend environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Never commit `.env` files or API keys to GitHub.

---

### 3. Frontend setup

```bash
cd ../frontend
pnpm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the development server:

```bash
pnpm dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

## 🔄 Running the Processing Pipeline

From the `tests` directory:

```powershell
cd tests
python run_classifier.py
```

Then return to the project root:

```powershell
cd ..
python -m backend.app.final_pipeline
```

The resulting files are generated under:

```text
submission/
```

including:

```text
classifier_submission.json
document_extractions.json
document_comparisons.json
final_submission.json
```

---

## 🖥️ Application

The web application provides several operational views.

### Dashboard

Provides an overview of:

* Total processed emails
* Email categories
* Verification status
* Defect fields
* Review reasons

### Inbox

Allows users to browse the processed shipping inbox and filter emails by operational status.

### Email Details

Shows:

* Sender
* Subject
* Email body
* Attachments
* Classification result

### Document Comparison

For BL comparison cases, users can view:

* Shipping Instruction
* Bill of Lading
* Extracted fields
* Comparison results
* Detected defect fields

### Review Queue

Human reviewers can inspect documents that require manual verification.

---

## 🧠 Design Philosophy

SDOC intentionally does **not** rely on an LLM alone.

### AI handles:

* Understanding document content
* Extracting structured information
* Supporting document interpretation

### Deterministic logic handles:

* Field comparison
* Status assignment
* Defect detection
* Review conditions

### Humans handle:

* Unreadable documents
* Ambiguous cases
* Missing information
* Exceptions requiring operational judgment

This separation makes the workflow easier to understand, audit, and extend.

---

## 📈 Impact

The current prototype demonstrates:

* **520 emails** processed
* **250 attachments** processed
* Automated classification across **5 categories**
* Automated SI ↔ BL field comparison
* Explicit discrepancy identification
* Human-review workflow for exceptions
* Original documents preserved for manual inspection

### Operational Goal

SDOC aims to reduce repetitive inbox triage, surface shipping-document discrepancies earlier, and provide operations teams with clearer evidence when manual review is required.

---

## 🔐 Security Notes

Sensitive credentials should never be committed to the repository.

The following files should remain local:

```text
backend/.env
frontend/.env.local
```

In production, secrets should be configured through the deployment platform's environment-variable management.

The Supabase service-role key must never be exposed to client-side code.

---

## 🚀 Future Improvements

Potential future enhancements include:

* Real-time email ingestion
* OCR for scanned documents
* More document types
* Confidence scoring
* Advanced document comparison
* Reviewer feedback loops
* Audit trails
* Role-based access control
* Cloud-native background processing
* Integration with existing shipping-management systems

---

## 👥 Team

Built for the **SDOC Shipping Inbox Hackathon**.

**Team:** AyamDamai

---

## 📜 Disclaimer

SDOC is a hackathon prototype intended to demonstrate an AI-assisted shipping operations workflow. Automated results should be reviewed by qualified personnel when documents are ambiguous, incomplete, or unreadable.
