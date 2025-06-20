// File: dashboard/src/pages/audit.tsx
// v1.1.0 - Enhanced with CSV Export, Email Summary, and Enhanced Diff Viewer

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DiffViewer from '../components/DiffViewer';

// Development configuration
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '' // In production, use relative paths
    : 'http://localhost:3070'; // In development, connect to local API

interface RepoEntry {
  name: string;
  status: 'missing' | 'extra' | 'dirty' | 'clean';
  clone_url?: string;
  local_path?: string;
  path?: string;
  remote?: string;
  uncommittedChanges?: boolean;
  missingFiles?: string[];
  dashboard_link?: string;
}

interface AuditReport {
  timestamp: string;
  health_status: 'green' | 'yellow' | 'red';
  summary: {
    total: number;
    missing: number;
    extra: number;
    dirty: number;
    clean: number;
  };
  repos: RepoEntry[];
}

const AuditPage = () => {
  const { repo } = useParams<{ repo: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const [data, setData] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffs, setDiffs] = useState<Record<string, string>>({});
  const [expandedRepo, setExpandedRepo] = useState<string | null>(repo || null);
  
  // v1.1.0 - New state for enhanced features
  const [showEnhancedDiff, setShowEnhancedDiff] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  // Handle repo parameter and action when component mounts or parameters change
  useEffect(() => {
    if (repo && data) {
      setExpandedRepo(repo);

      // Auto-load diff when action is 'view' and repo status is 'dirty'
      if (action === 'view') {
        const repoData = data.repos.find((r) => r.name === repo);
        if (
          repoData &&
          (repoData.status === 'dirty' || repoData.uncommittedChanges)
        ) {
          loadDiff(repo);
        }
      }

      // Scroll to the repository if it exists
      const repoElement = document.getElementById(`repo-${repo}`);
      if (repoElement) {
        repoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [repo, action, data]);

  useEffect(() => {
    const fetchAudit = () => {
      axios
        .get(`${API_BASE_URL}/audit`)
        .then((res: { data: AuditReport }) => {
          // Transform data if needed to match expected interface
          const reportData = res.data;

          // If repo objects don't have 'status' field but have 'uncommittedChanges',
          // derive status from other fields
          if (
            reportData.repos &&
            reportData.repos.length > 0 &&
            reportData.repos[0].status === undefined
          ) {
            reportData.repos = reportData.repos.map((repo) => ({
              ...repo,
              status: repo.uncommittedChanges ? 'dirty' : 'clean',
              local_path: repo.path, // Normalize field names
            }));
          }

          setData(reportData);
        })
        .catch((err: any) => {
          console.error('Failed to load audit data:', err);
          // Fallback to static file in development
          if (process.env.NODE_ENV !== 'production') {
            fetch('/GitRepoReport.json')
              .then((res) => res.json())
              .then((data) => {
                console.log('Using fallback data source');
                setData(data);
              })
              .catch((err) =>
                console.error('Failed to load fallback data:', err)
              )
              .finally(() => setLoading(false));
          }
        })
        .finally(() => setLoading(false));
    };

    fetchAudit();
    const interval = setInterval(fetchAudit, 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = async (action: string, repo: RepoEntry) => {
    try {
      const body: any = { repo: repo.name };
      if (action === 'clone') body['clone_url'] = repo.clone_url || repo.remote;
      const response = await axios.post(
        `${API_BASE_URL}/audit/${action}`,
        body
      );
      alert(response.data.status);
    } catch (err: any) {
      console.error(`Action failed:`, err);
      alert(`Failed to ${action} ${repo.name}`);
    }
  };

  const loadDiff = async (repo: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/audit/diff/${repo}`);
      setDiffs((prev) => ({ ...prev, [repo]: res.data.diff }));
    } catch (err: any) {
      console.error(`Load diff failed:`, err);
      alert(`Failed to load diff for ${repo}`);
    }
  };

  // v1.1.0 - CSV Export functionality
  const exportToCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/export/csv`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from content-disposition header or create default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `gitops-audit-${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('📊 CSV export downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // v1.1.0 - Email Summary functionality
  const sendEmailSummary = async () => {
    if (!emailAddress) {
      alert('Please enter an email address');
      return;
    }

    setEmailSending(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/audit/email-summary`, {
        email: emailAddress
      });
      
      alert(`✅ Email sent successfully to ${emailAddress}`);
      setEmailAddress('');
      console.log('📧 Email summary sent:', response.data);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      alert('Failed to send email summary. Please check the email address and try again.');
    } finally {
      setEmailSending(false);
    }
  };

  // v1.1.0 - Enhanced diff viewer
  const showEnhancedDiffViewer = async (repo: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/audit/diff/${repo}`);
      setExpandedRepo(repo); // Set the repo name for the diff viewer title
      setShowEnhancedDiff(res.data.diff);
    } catch (err: any) {
      console.error(`Load diff failed:`, err);
      alert(`Failed to load diff for ${repo}`);
    }
  };

  const getColor = (status: string) => {
    if (status === 'red') return 'bg-red-600';
    if (status === 'yellow') return 'bg-yellow-400';
    return 'bg-green-500';
  };

  if (loading) return <div className="p-4">Loading audit data...</div>;
  if (!data)
    return <div className="p-4 text-red-500">Failed to load audit report.</div>;

  return (
    <div className="p-4">
      {/* v1.1.0 - Enhanced Header with Export Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full mr-2 ${getColor(
              data.health_status
            )}`}
          />
          <h1 className="text-2xl font-bold">
            Repository Audit - {data.timestamp}
          </h1>
        </div>
        
        {/* v1.1.0 - Export and Email Controls */}
        <div className="flex items-center space-x-4">
          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            title="Export audit data as CSV"
          >
            <span>📊</span>
            <span>Export CSV</span>
          </button>
          
          {/* Email Summary Section */}
          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email for summary"
              className="border rounded px-3 py-2 text-sm w-48"
            />
            <button
              onClick={sendEmailSummary}
              disabled={emailSending || !emailAddress}
              className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 ${
                emailSending || !emailAddress 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title="Send email summary"
            >
              <span>📧</span>
              <span>{emailSending ? 'Sending...' : 'Email Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.repos.map((repoItem, i) => (
          <div
            key={i}
            className={`border rounded-xl p-4 shadow ${
              expandedRepo === repoItem.name ? 'ring-2 ring-blue-500' : ''
            }`}
            id={`repo-${repoItem.name}`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{repoItem.name}</h2>
              <span className="text-sm text-gray-500 capitalize">
                {repoItem.status}
              </span>
            </div>
            <div className="text-xs mt-2 text-gray-500">
              {repoItem.local_path && <div>📁 {repoItem.local_path}</div>}
              {repoItem.clone_url && <div>🌐 {repoItem.clone_url}</div>}
            </div>
            <div className="mt-4 space-x-2">
              {(repoItem.status === 'missing' ||
                (repoItem.status === undefined && repoItem.clone_url)) && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => triggerAction('clone', repoItem)}
                >
                  Clone
                </button>
              )}
              {repoItem.status === 'extra' && (
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => triggerAction('delete', repoItem)}
                >
                  Delete
                </button>
              )}
              {(repoItem.status === 'dirty' || repoItem.uncommittedChanges) && (
                <>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => triggerAction('commit', repoItem)}
                  >
                    Commit
                  </button>
                  <button
                    className="bg-gray-600 text-white px-3 py-1 rounded"
                    onClick={() => triggerAction('discard', repoItem)}
                  >
                    Discard
                  </button>
                  <button
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                    onClick={() => loadDiff(repoItem.name)}
                  >
                    Quick Diff
                  </button>
                  {/* v1.1.0 - Enhanced Diff Viewer Button */}
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                    onClick={() => showEnhancedDiffViewer(repoItem.name)}
                  >
                    Enhanced Diff
                  </button>
                </>
              )}
            </div>
            {diffs[repoItem.name] && (
              <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-x-auto whitespace-pre-wrap">
                {diffs[repoItem.name]}
              </pre>
            )}
          </div>
        ))}
      </div>
      
      {/* v1.1.0 - Enhanced Diff Viewer Modal */}
      {showEnhancedDiff && (
        <DiffViewer
          diffContent={showEnhancedDiff}
          repoName={expandedRepo || 'Repository'}
          onClose={() => setShowEnhancedDiff(null)}
        />
      )}
    </div>
  );
};

export default AuditPage;
