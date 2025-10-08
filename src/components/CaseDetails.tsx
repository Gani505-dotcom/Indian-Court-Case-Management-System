import React from 'react';
import { Download, FileText, Calendar, Users, Gavel, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';

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

interface CaseDetailsProps {
  caseData: CaseData;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disposed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under consideration': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // const downloadJudgmentPDF = () => {
  //   if (caseData.judgment_path) {
  //     const link = document.createElement('a');
  //     link.href = caseData.judgment_path;
  //     link.download = `judgment_${caseData.case_type}_${caseData.case_number}_${caseData.year}.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };
const downloadJudgmentPDF = async () => {
  if (caseData.judgment_path) {
    try {
      // Fetch the PDF from the URL
      const response = await fetch(caseData.judgment_path);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `judgment_${caseData.case_type}_${caseData.case_number}_${caseData.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: open in new tab
      window.open(caseData.judgment_path, '_blank');
    }
  }
};

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Case Details', 20, 30);
    
    // Add case information
    doc.setFontSize(12);
    let yPos = 50;
    
    const details = [
      ['Case Number:', `${caseData.case_type} ${caseData.case_number}/${caseData.year}`],
      ['Court:', caseData.court],
      ['Parties:', caseData.parties],
      ['Filing Date:', formatDate(caseData.filing_date)],
      ['Next Hearing:', formatDate(caseData.next_hearing_date)],
      ['Status:', caseData.status]
    ];
    
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPos);
      yPos += 15;
    });
    
    // Save the PDF
    doc.save(`case_${caseData.case_number}_${caseData.year}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Case Details</h3>
        </div>
        <button
          onClick={exportToPDF}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Gavel className="h-5 w-5 mr-2 text-blue-600" />
              Case Information
            </h4>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Case Number:</span>
                <p className="text-lg font-bold text-blue-600">
                  {caseData.case_type} {caseData.case_number}/{caseData.year}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Court:</span>
                <p className="text-gray-900">{caseData.court}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(caseData.status)}`}>
                  {caseData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Parties Involved
            </h4>
            <p className="text-gray-900 font-medium">{caseData.parties}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Important Dates
            </h4>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Filing Date:</span>
                <p className="text-gray-900">{formatDate(caseData.filing_date)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Next Hearing:</span>
                <p className="text-gray-900 font-medium text-green-600">
                  {formatDate(caseData.next_hearing_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-600" />
              Documents
            </h4>
            {caseData.judgment_path ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <span className="text-gray-900">Judgment/Order Available</span>
                </div>
                <button 
                  onClick={downloadJudgmentPDF}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                >
                  Download PDF
                </button>
              </div>
            ) : (
              <p className="text-gray-600 italic">No judgment/order uploaded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Track Updates</span>
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;