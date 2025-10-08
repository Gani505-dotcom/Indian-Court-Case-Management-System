import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import CaseDetails from './CaseDetails';

interface Court {
  high_courts: string[];
  district_courts: string[];
}

interface CaseData {
  id?: number;
  case_type: string;
  case_number: number;
  year: number;
  court: string;
  parties: string;
  filing_date: string;
  next_hearing_date: string;
  status: string;
  judgment_path?: string;
}

const CaseSearchForm: React.FC = () => {
  const [courts, setCourts] = useState<Court>({ high_courts: [], district_courts: [] });
  const [formData, setFormData] = useState({
    caseType: '',
    caseNumber: '',
    year: new Date().getFullYear().toString(),
    court: ''
  });
  const [caseData, setCaseData] = useState<CaseData | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCaseData(null);

    try {
      const response = await fetch('http://localhost:3001/api/search-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseType: formData.caseType,
          caseNumber: parseInt(formData.caseNumber),
          year: parseInt(formData.year),
          court: formData.court
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }

      const data = await response.json();
      setCaseData(data);
    } catch (err) {
      setError('Failed to fetch case details. Please check your inputs and try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Search Case Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Case Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Type
              </label>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Case Type</option>
                <option value="WP">WP (Writ Petition)</option>
                <option value="CRL">CRL (Criminal)</option>
                <option value="CIV">CIV (Civil)</option>
                <option value="MAT">MAT (Matrimonial)</option>
                <option value="SA">SA (Second Appeal)</option>
                <option value="FAO">FAO (First Appeal)</option>
              </select>
            </div>

            {/* Case Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Number
              </label>
              <input
                type="number"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleInputChange}
                placeholder="Enter case number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Court Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Court
              </label>
              <select
                name="court"
                value={formData.court}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
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
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>{loading ? 'Searching...' : 'Search Case'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Case Details */}
      {caseData && <CaseDetails caseData={caseData} />}
    </div>
  );
};

export default CaseSearchForm;