import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Calendar, TrendingUp, Database, Scale } from 'lucide-react';

interface CaseData {
  id: number;
  case_type: string;
  case_number: number;
  year: number;
  court: string;
  parties: string;
  filing_date: string;
  next_hearing_date: string;
  status: string;
  judgment_path?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cases');
      const data = await response.json();
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = { pending: 0, disposed: 0, consideration: 0, scheduled: 0 };
    cases.forEach(caseData => {
      switch (caseData.status.toLowerCase()) {
        case 'pending':
          stats.pending++;
          break;
        case 'disposed':
          stats.disposed++;
          break;
        case 'under consideration':
          stats.consideration++;
          break;
        case 'next hearing scheduled':
          stats.scheduled++;
          break;
      }
    });
    return stats;
  };

  const getCourtStats = () => {
    const courtCounts: { [key: string]: number } = {};
    cases.forEach(caseData => {
      courtCounts[caseData.court] = (courtCounts[caseData.court] || 0) + 1;
    });
    return Object.entries(courtCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const stats = getStatusStats();
  const topCourts = getCourtStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        </div>
        <p className="text-gray-600">
          Monitor your case search history and system statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disposed Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disposed}</p>
            </div>
            <Scale className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.consideration}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts and Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Courts Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Top Courts by Cases</h3>
          </div>
          <div className="space-y-4">
            {topCourts.map(([court, count], index) => (
              <div key={court} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-6">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-gray-900 truncate max-w-xs">
                    {court}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-200 h-2 rounded-full flex-1 max-w-20">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...topCourts.map(([,c]) => c))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Recent Cases</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {cases.slice(0, 10).map((caseData) => (
              <div key={caseData.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {caseData.case_type} {caseData.case_number}/{caseData.year}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {caseData.parties}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(caseData.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                  caseData.status.toLowerCase() === 'disposed' ? 'bg-green-100 text-green-800' :
                  caseData.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {caseData.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Case Status Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Pending', count: stats.pending, color: 'yellow' },
            { label: 'Disposed', count: stats.disposed, color: 'green' },
            { label: 'Under Consideration', count: stats.consideration, color: 'blue' },
            { label: 'Next Hearing', count: stats.scheduled, color: 'purple' }
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-${color}-100 flex items-center justify-center`}>
                <span className={`text-2xl font-bold text-${color}-600`}>{count}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">
                {cases.length > 0 ? Math.round((count / cases.length) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;