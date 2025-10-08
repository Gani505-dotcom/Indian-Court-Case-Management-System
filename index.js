import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/static', express.static(join(__dirname, 'static')));

// Initialize SQLite Database
const db = new sqlite3.Database('ecourts.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_type TEXT NOT NULL,
    case_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    court TEXT NOT NULL,
    parties TEXT,
    filing_date TEXT,
    next_hearing_date TEXT,
    status TEXT,
    judgment_path TEXT,
    raw_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cause_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court TEXT NOT NULL,
    date TEXT NOT NULL,
    cases TEXT,
    raw_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Mock data for courts
const HIGH_COURTS = [
  'Allahabad High Court',
  'Andhra Pradesh High Court',
  'Bombay High Court',
  'Calcutta High Court',
  'Chhattisgarh High Court',
  'Delhi High Court',
  'Gauhati High Court',
  'Gujarat High Court',
  'Himachal Pradesh High Court',
  'Jammu and Kashmir High Court',
  'Jharkhand High Court',
  'Karnataka High Court',
  'Kerala High Court',
  'Madhya Pradesh High Court',
  'Madras High Court',
  'Manipur High Court',
  'Meghalaya High Court',
  'Orissa High Court',
  'Patna High Court',
  'Punjab and Haryana High Court',
  'Rajasthan High Court',
  'Sikkim High Court',
  'Supreme Court of India',
  'Telangana High Court',
  'Tripura High Court',
  'Uttarakhand High Court'
];

const DISTRICT_COURTS = [
  'New Delhi District Court',
  'Mumbai District Court',
  'Kolkata District Court',
  'Chennai District Court',
  'Bangalore District Court',
  'Hyderabad District Court',
  'Pune District Court',
  'Ahmedabad District Court',
  'Jaipur District Court',
  'Lucknow District Court'
];

// Mock case data generator
function generateMockCaseData(caseType, caseNumber, year, court) {
  const statuses = ['Pending', 'Disposed', 'Under Consideration', 'Next Hearing Scheduled'];
  const parties = [
    'Ram Kumar vs. State of Delhi',
    'ABC Company Ltd. vs. XYZ Corporation',
    'Priya Sharma vs. Municipal Corporation',
    'Union of India vs. Private Ltd.',
    'Citizen Welfare Association vs. State Government'
  ];

  return {
    case_type: caseType,
    case_number: caseNumber,
    year: year,
    court: court,
    parties: parties[Math.floor(Math.random() * parties.length)],
    filing_date: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    next_hearing_date: `2024-${String(Math.floor(Math.random() * 6) + 7).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    judgment_path: Math.random() > 0.5 ? `/static/judgments/case_${caseNumber}_${year}.pdf` : null
  };
}

// API Routes

// Get all courts
app.get('/api/courts', (req, res) => {
  res.json({
    high_courts: HIGH_COURTS,
    district_courts: DISTRICT_COURTS
  });
});

// Search case
app.post('/api/search-case', (req, res) => {
  const { caseType, caseNumber, year, court } = req.body;

  if (!caseType || !caseNumber || !year || !court) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if case already exists in database
  db.get(
    `SELECT * FROM cases WHERE case_type = ? AND case_number = ? AND year = ? AND court = ?`,
    [caseType, caseNumber, year, court],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.json(row);
      }

      // Generate mock data and save to database
      const mockData = generateMockCaseData(caseType, caseNumber, year, court);
      
      db.run(
        `INSERT INTO cases (case_type, case_number, year, court, parties, filing_date, next_hearing_date, status, judgment_path, raw_response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mockData.case_type, mockData.case_number, mockData.year, mockData.court, mockData.parties, 
         mockData.filing_date, mockData.next_hearing_date, mockData.status, mockData.judgment_path, 
         JSON.stringify(mockData)],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save case data' });
          }
          
          mockData.id = this.lastID;
          res.json(mockData);
        }
      );
    }
  );
});

// Fetch cause list
app.post('/api/cause-list', (req, res) => {
  const { court, date } = req.body;

  if (!court || !date) {
    return res.status(400).json({ error: 'Missing court or date' });
  }

  // Check if cause list already exists
  db.get(
    `SELECT * FROM cause_lists WHERE court = ? AND date = ?`,
    [court, date],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.json(JSON.parse(row.cases));
      }

      // Generate mock cause list data
      const mockCases = [];
      const caseCount = Math.floor(Math.random() * 15) + 5; // 5-20 cases

      for (let i = 0; i < caseCount; i++) {
        mockCases.push({
          case_number: `${Math.floor(Math.random() * 999) + 1}/${new Date(date).getFullYear()}`,
          case_type: ['CRL', 'CIV', 'WP', 'MAT', 'SA'][Math.floor(Math.random() * 5)],
          parties: [
            'Ram Kumar vs. State',
            'ABC Ltd. vs. XYZ Corp',
            'Citizens Union vs. Municipal Corp',
            'State vs. John Doe',
            'Private Ltd. vs. Government'
          ][Math.floor(Math.random() * 5)],
          judge: [
            'Hon\'ble Justice A.K. Sharma',
            'Hon\'ble Justice Priya Gupta',
            'Hon\'ble Justice R.K. Singh',
            'Hon\'ble Justice M. Patel',
            'Hon\'ble Justice S. Kumar'
          ][Math.floor(Math.random() * 5)],
          court_hall: `Court No. ${Math.floor(Math.random() * 10) + 1}`,
          hearing_time: ['10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM'][Math.floor(Math.random() * 5)]
        });
      }

      // Save to database
      db.run(
        `INSERT INTO cause_lists (court, date, cases, raw_response) VALUES (?, ?, ?, ?)`,
        [court, date, JSON.stringify(mockCases), JSON.stringify({ court, date, cases: mockCases })],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save cause list' });
          }
          
          res.json(mockCases);
        }
      );
    }
  );
});

// Get all cases (for dashboard)
app.get('/api/cases', (req, res) => {
  db.all('SELECT * FROM cases ORDER BY created_at DESC LIMIT 50', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});