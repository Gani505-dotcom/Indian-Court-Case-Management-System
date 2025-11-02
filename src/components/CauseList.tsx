import React, { useState, useEffect } from 'react';
import { Calendar, Download, Search, Clock, User, Building } from 'lucide-react';
import jsPDF from 'jspdf';

interface Court {
  high_courts: string[];
  district_courts: string[];
}

interface CauseListItem {
  case_number: string;
  case_type: string;
  parties: string;
  judge: string;
  court_hall: string;
  hearing_time: string;
}

const CauseList: React.FC = () => {
  const [courts, setCourts] = useState<Court>({ high_courts: [], district_courts: [] });
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [causeListData, setCauseListData] = useState<CauseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/courts');
      const data = await response.json();
      setCourts(data);
    } catch (err) {
      console.error('Failed to fetch courts:', err);
    }
  };

  const fetchCauseList = async () => {
    if (!selectedCourt || !selectedDate) {
      setError('Please select both court and date');
      return;
    }

    setLoading(true);
    setError('');
    setCauseListData([]);

    try {
      const response = await fetch('http://localhost:3001/api/cause-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          court: selectedCourt,
          date: selectedDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cause list');
      }

      const data = await response.json();
      setCauseListData(data);
    } catch (err) {
      setError('Failed to fetch cause list. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (causeListData.length === 0) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Daily Cause List', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Court: ${selectedCourt}`, 20, 45);
    doc.text(`Date: ${new Date(selectedDate).toLocaleDateString('en-IN')}`, 20, 55);
    
    // Table headers
    let yPos = 75;
    const headers = ['S.No.', 'Case No.', 'Parties', 'Judge', 'Court Hall', 'Time'];
    const colWidths = [15, 30, 60, 45, 25, 25];
    let xPos = 15;
    
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPos);
      xPos += colWidths[index];
    });
    
    // Table data
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    causeListData.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
      
      xPos = 15;
      const rowData = [
        (index + 1).toString(),
        `${item.case_type} ${item.case_number}`,
        item.parties.substring(0, 25) + (item.parties.length > 25 ? '...' : ''),
        item.judge.substring(0, 20) + (item.judge.length > 20 ? '...' : ''),
        item.court_hall,
        item.hearing_time
      ];
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, xPos, yPos);
        xPos += colWidths[colIndex];
      });
      
      yPos += 8;
    });
    
    // Save the PDF
    doc.save(`cause_list_${selectedDate}_${selectedCourt.replace(/\s+/g, '_')}.pdf`);
  };

  const exportToCSV = () => {
    if (causeListData.length === 0) return;

    const headers = ['Case Number', 'Case Type', 'Parties', 'Judge', 'Court Hall', 'Hearing Time'];
    const csvContent = [
      headers.join(','),
      ...causeListData.map(item => [
        `"${item.case_type} ${item.case_number}"`,
        `"${item.case_type}"`,
        `"${item.parties}"`,
        `"${item.judge}"`,
        `"${item.court_hall}"`,
        `"${item.hearing_time}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cause_list_${selectedDate}_${selectedCourt.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Daily Cause List</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Court Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Court
            </label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Court</option>
              <optgroup label="High Courts">
                {courts.high_courts.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </optgroup>
              <optgroup label="District Courts">
                {courts.district_courts.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Fetch Button */}
          <div className="flex items-end">
            <button
              onClick={fetchCauseList}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>{loading ? 'Fetching...' : 'Fetch Cause List'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Cause List Results */}
      {causeListData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Cause List for {new Date(selectedDate).toLocaleDateString('en-IN')}
              </h3>
              <p className="text-gray-600">{selectedCourt}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Court Hall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {causeListData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.case_type} {item.case_number}
                      </div>
                      <div className="text-sm text-gray-500">{item.case_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.parties}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{item.judge}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{item.court_hall}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{item.hearing_time}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {causeListData.length} cases for {new Date(selectedDate).toLocaleDateString('en-IN')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CauseList;