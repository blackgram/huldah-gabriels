/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { getWaitlistEntries } from '../../services/waitListService';
import { sendBulkEmail, sendTestEmail } from '../../services/emailService';

// You'll need to implement these functions in your emailService
const EMAIL_TEMPLATES = {
  LAUNCH_ANNOUNCEMENT: 'LAUNCH_ANNOUNCEMENT',
  EXCLUSIVE_PREVIEW: 'EXCLUSIVE_PREVIEW',
  DISCOUNT_OFFER: 'DISCOUNT_OFFER'
};

const AdminWaitlist: React.FC = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(EMAIL_TEMPLATES.LAUNCH_ANNOUNCEMENT);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const entries = await getWaitlistEntries();
      setWaitlistEntries(entries);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load waitlist entries' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    setIsSending(true);
    try {
      await sendTestEmail(testEmail, selectedTemplate as any);
      setMessage({ type: 'success', text: 'Test email sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (!window.confirm(`Are you sure you want to send ${selectedTemplate} emails to all uncontacted waitlist subscribers?`)) {
      return;
    }

    setIsSending(true);
    try {
      await sendBulkEmail(selectedTemplate as any);
      setMessage({ type: 'success', text: 'Bulk emails sent successfully!' });
      // Refresh the waitlist to update contact status
      await fetchWaitlist();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send bulk emails' });
    } finally {
      setIsSending(false);
    }
  };

  const exportWaitlist = () => {
    // Create CSV content
    const csvContent = [
      ['Email', 'Name', 'Signup Date', 'Contacted'],
      ...waitlistEntries.map(entry => [
        entry.email,
        entry.name || '',
        entry.timestamp?.toDate?.() ? entry.timestamp.toDate().toLocaleString() : 'N/A',
        entry.hasBeenContacted ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
          <button
            className="ml-2 font-bold"
            onClick={() => setMessage({ type: '', text: '' })}
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 lg:max-w-[90%] xl:max-w-[100%]">
        {/* Email Campaign Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Send Emails</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value={EMAIL_TEMPLATES.LAUNCH_ANNOUNCEMENT}>Launch Announcement</option>
              <option value={EMAIL_TEMPLATES.EXCLUSIVE_PREVIEW}>Exclusive Preview</option>
              <option value={EMAIL_TEMPLATES.DISCOUNT_OFFER}>Discount Offer</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send Test Email
            </label>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email for testing"
                className="flex-grow border border-gray-300 rounded-l-md p-2"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleSendTestEmail}
                disabled={isSending || !testEmail}
              >
                {isSending ? 'Sending...' : 'Test'}
              </button>
            </div>
          </div>

          <button
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:bg-primary/50"
            onClick={handleSendBulkEmail}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : `Send to All Uncontacted Subscribers`}
          </button>
        </div>

        {/* Waitlist Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Waitlist Statistics</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Subscribers</p>
                  <p className="text-2xl font-bold text-primary">{waitlistEntries.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Uncontacted</p>
                  <p className="text-2xl font-bold text-primary">
                    {waitlistEntries.filter(entry => !entry.hasBeenContacted).length}
                  </p>
                </div>
              </div>

              <button
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center"
                onClick={exportWaitlist}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export to CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-hidden lg:max-w-[90%] xl:max-w-[100%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Waitlist Entries</h2>
          <button
            className="text-primary hover:text-primary/80"
            onClick={fetchWaitlist}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : waitlistEntries.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No waitlist entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signup Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {waitlistEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.timestamp?.toDate?.() ? new Date(entry.timestamp.toDate()).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.hasBeenContacted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {entry.hasBeenContacted ? 'Contacted' : 'Not Contacted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminWaitlist;