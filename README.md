# Indian-Court-Case-Management-System

🏛️ Indian Court Case Details & Cause List Fetcher

A full-stack web application that allows users to fetch Indian court case details (for all High Courts and all District Courts) directly from official eCourts portals, display structured details, fetch cause lists, and provide downloadable judgments/orders in PDF format.

✨ Features

🔍 Case Search

Search by Case Type, Case Number, Year, and Court (High Court or District Court).

Fetch and display:

Parties’ names (Petitioner vs. Respondent)

Filing date

Next hearing date

Case status (Pending / Disposed / Others)

Judgment/Order PDFs (if available).

📅 Cause List Fetching

Select a Court and Date to fetch daily cause lists.

View structured details: case numbers, parties, judge, bench info, hearing time.

Export cause list as PDF or CSV.

💾 Database Storage

Every query and raw response stored in SQLite/PostgreSQL.

Case details and cause lists are persisted for reuse.

📑 Export Options

Download Judgment PDFs directly from portals.

Export displayed details or cause list as PDF or CSV.

⚡ Error Handling

Graceful handling of invalid inputs, unavailable data, or offline portals.

User-friendly error messages.

🛠️ Tech Stack

Frontend:

React.js (modern UI)

Tailwind CSS / Bootstrap (styling)

jsPDF (client-side PDF export)

Backend:

Python Flask / Django

requests + BeautifulSoup + lxml (scraping)

Selenium (optional, for JS-heavy portals)

Database:

SQLite (development)

PostgreSQL (production)

File Storage:

Judgments/orders saved under static/judgments/.

📂 Project Structure
court-case-fetcher/
│── backend/
│   ├── app.py                # Flask/Django backend  
│   ├── scraper.py            # Scraper logic for High Courts & District Courts  
│   ├── models.py             # Database models (cases, cause_lists)  
│   ├── static/judgments/     # Downloaded PDFs  
│   └── templates/            # Optional (if server-rendered views)  
│
│── frontend/
│   ├── src/  
│   │   ├── components/       # React components  
│   │   ├── pages/            # UI pages (CaseSearch, CauseList, Results)  
│   │   ├── App.js            # Main app  
│   │   └── index.js          # Entry point  
│   └── public/               # Static files  
│
│── database/
│   └── schema.sql            # DB schema (SQLite/Postgres)  
│
│── README.md                 # Project documentation  
│── requirements.txt          # Python dependencies  
│── package.json              # Node.js dependencies  

🚀 Setup & Installation
1️⃣ Clone Repo
git clone https://github.com/your-username/court-case-fetcher.git
cd court-case-fetcher

2️⃣ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)

pip install -r requirements.txt


Run backend:

python app.py

3️⃣ Frontend Setup
cd frontend
npm install
npm start

⚙️ Usage

Open the frontend (http://localhost:5173
).

Enter Case Type, Number, Year, Court → click Search.

Results display in a table with option to Download Judgment.

Select Cause List, choose Court + Date → Fetch daily cause list.

Use Export PDF/CSV buttons to download results.

🗄️ Database Schema
cases table
Column	Type	Description
id (PK)	int	Unique ID
case_type	text	WP, CRL, CS, etc.
case_number	int	Case number
year	int	Year (YYYY)
court	text	Court name
parties	text/json	Petitioner vs Respondent
filing_date	date	Filing date
next_hearing_date	date	Next hearing
status	text	Case status
judgment_path	text	File path to PDF judgment
raw_response	text	Raw HTML/JSON scraped
created_at	timestamp	Time of record creation
cause_lists table
Column	Type	Description
id (PK)	int	Unique ID
court	text	Court name
date	date	Date of cause list
cases	json	Case numbers, parties, judge, time
raw_response	text	Raw response data
created_at	timestamp	Time of record creation
🔮 Future Enhancements

🔔 Notifications for next hearing dates.

📱 Mobile-friendly UI (PWA).

🔎 Search history & filters for stored cases.

🧑‍⚖️ Integration with Supreme Court of India judgments database.

📜 License

MIT License © 2025 Mandadi Ganesh
