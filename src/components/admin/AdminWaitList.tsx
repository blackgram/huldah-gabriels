/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { getWaitlistEntries, deleteWaitlistEntry } from '../../services/waitListService';
import { sendTestEmail, EMAIL_TEMPLATES, EmailTemplateType } from '../../services/emailService';
import { FiRefreshCw, FiDownload, FiMail, FiTrash2, FiMoreVertical } from 'react-icons/fi';

interface WaitlistEntry {
  id?: string;
  email: string;
  name?: string;
  timestamp: any;
  hasBeenContacted?: boolean;
}

const AdminWaitlist: React.FC = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(EMAIL_TEMPLATES.LAUNCH_ANNOUNCEMENT as EmailTemplateType);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showSingleEmailModal, setShowSingleEmailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [singleEmailTemplate, setSingleEmailTemplate] = useState<EmailTemplateType>(EMAIL_TEMPLATES.WELCOME as EmailTemplateType);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

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

    if (!/^\S+@\S+\.\S+$/.test(testEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSending(true);
    setMessage({ type: '', text: '' });
    
    try {
      await sendTestEmail(testEmail, selectedTemplate);
      setMessage({ type: 'success', text: 'Test email sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email. Please check your email configuration.' });
      console.error('Test email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBulkEmail = async () => {
    const uncontactedCount = waitlistEntries.filter(entry => !entry.hasBeenContacted).length;
    
    if (uncontactedCount === 0) {
      setMessage({ type: 'error', text: 'There are no uncontacted subscribers to email.' });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to send "${selectedTemplate}" emails to ${uncontactedCount} uncontacted waitlist subscribers?`)) {
      return;
    }

    setIsSending(true);
    setMessage({ type: '', text: '' });
    
    try {
      await import('../../services/emailService').then(module => {
        return module.sendBulkEmail(selectedTemplate);
      });
      setMessage({ type: 'success', text: 'Bulk emails sent successfully! Recipients have been marked as contacted.' });
      // Refresh the waitlist to update contact status
      await fetchWaitlist();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send bulk emails. Please check your email configuration.' });
      console.error('Bulk email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSingleEmail = async () => {
    if (!selectedEntry) return;
    
    setIsSending(true);
    setMessage({ type: '', text: '' });
    
    try {
      await sendTestEmail(selectedEntry.email, singleEmailTemplate);
      
      // Mark the entry as contacted
      const updatedEntries = waitlistEntries.map(entry => 
        entry.id === selectedEntry.id ? { ...entry, hasBeenContacted: true } : entry
      );
      setWaitlistEntries(updatedEntries);
      
      // Update the database with contacted status
      await import('../../services/waitListService').then(module => {
        return module.markEmailAsContacted(selectedEntry.email);
      });
      
      setMessage({ type: 'success', text: `Email sent successfully to ${selectedEntry.email}!` });
      setShowSingleEmailModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send email. Please check your email configuration.' });
      console.error('Single email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenSendEmail = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setShowSingleEmailModal(true);
    setShowActionMenu(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    
    if (!window.confirm("Are you sure you want to delete this waitlist entry? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    
    try {
      await deleteWaitlistEntry(id);
      setWaitlistEntries(waitlistEntries.filter(entry => entry.id !== id));
      setMessage({ type: 'success', text: 'Waitlist entry deleted successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete waitlist entry.' });
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(null);
      setShowActionMenu(null);
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

  const toggleActionMenu = (id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id);
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
              onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplateType)}
            >
              <option value={EMAIL_TEMPLATES.WELCOME}>Welcome</option>
              <option value={EMAIL_TEMPLATES.LAUNCH_ANNOUNCEMENT}>Launch Announcement</option>
              <option value={EMAIL_TEMPLATES.EXCLUSIVE_PREVIEW}>Exclusive Preview</option>
              <option value={EMAIL_TEMPLATES.DISCOUNT_OFFER}>Discount Offer</option>
              <option value={EMAIL_TEMPLATES.VERIFICATION}>Verification</option>
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
            disabled={isSending || waitlistEntries.filter(entry => !entry.hasBeenContacted).length === 0}
          >
            {isSending ? 'Sending...' : `Send to ${waitlistEntries.filter(entry => !entry.hasBeenContacted).length} Uncontacted Subscribers`}
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
                <FiDownload className="w-5 h-5 mr-2" />
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
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleActionMenu(entry.id || '')}
                      >
                        <FiMoreVertical />
                      </button>
                      
                      {showActionMenu === entry.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={() => handleOpenSendEmail(entry)}
                            >
                              <FiMail className="mr-2" /> Send Email
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              onClick={() => handleDelete(entry.id)}
                              disabled={isDeleting === entry.id}
                            >
                              {isDeleting === entry.id ? (
                                <span className="flex items-center">
                                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-red-600 rounded-full"></div>
                                  Deleting...
                                </span>
                              ) : (
                                <>
                                  <FiTrash2 className="mr-2" /> Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Email Modal */}
      {showSingleEmailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Email to {selectedEntry.email}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Template
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={singleEmailTemplate}
                onChange={(e) => setSingleEmailTemplate(e.target.value as EmailTemplateType)}
              >
                <option value={EMAIL_TEMPLATES.WELCOME}>Welcome</option>
                <option value={EMAIL_TEMPLATES.LAUNCH_ANNOUNCEMENT}>Launch Announcement</option>
                <option value={EMAIL_TEMPLATES.EXCLUSIVE_PREVIEW}>Exclusive Preview</option>
                <option value={EMAIL_TEMPLATES.DISCOUNT_OFFER}>Discount Offer</option>
                <option value={EMAIL_TEMPLATES.VERIFICATION}>Verification</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setShowSingleEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-primary/50"
                onClick={handleSendSingleEmail}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminWaitlist;