import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, FileText, Calendar, Download, Scale, Database } from 'lucide-react';
import CaseSearchForm from './components/CaseSearchForm';
import CaseDetails from './components/CaseDetails';
import CauseList from './components/CauseList';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">eCourts Case Tracker</h1>
                <p className="text-sm text-gray-600">Indian Court Case Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'search', label: 'Case Search', icon: Search },
              { id: 'cause-list', label: 'Cause List', icon: Calendar },
              { id: 'dashboard', label: 'Dashboard', icon: Database }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && <CaseSearchForm />}
        {activeTab === 'cause-list' && <CauseList />}
        {activeTab === 'dashboard' && <Dashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 eCourts Case Tracker. Built for educational purposes. 
            Data fetched from official eCourts portals.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;