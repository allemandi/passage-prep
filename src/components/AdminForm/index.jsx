import React, { useState, useEffect, useCallback } from 'react';
import useSessionTimeout from './useSessionTimeout';
import Login from './Login';
import ReviewApprove from './ReviewApprove';
import Upload from './Upload';
import EditDelete from './EditDelete';
import Download from './Download';

import { useToast } from '../ToastMessage/Toast';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const buttons = [
  { name: 'edit', label: 'Edit/Delete' },
  { name: 'review', label: 'Review/Approve' },
  { name: 'download', label: 'Download' },
  { name: 'upload', label: 'Bulk Upload' },
];

export default function AdminForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const showToast = useToast();

  const handleLogout = useCallback(
    (reason) => {
      setIsLoggedIn(false);
      sessionStorage.removeItem('isLoggedIn');

      if (reason === 'inactivity') {
        showToast('Logged out due to inactivity', 'error');
      } else if (reason === 'manual') {
        showToast('Logged out successfully', 'success');
      }
    },
    [showToast]
  );

  useSessionTimeout(() => handleLogout('inactivity'), isLoggedIn, SESSION_TIMEOUT_MS);

  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const renderContent = () => {
    switch (activeButton) {
      case 'edit':
        return <EditDelete />;
      case 'review':
        return <ReviewApprove />;
      case 'download':
        return <Download />;
      case 'upload':
        return <Upload />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg">
        {!isLoggedIn ? (
          <Login setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-primary-500 border-b-2 border-primary-500 pb-2 mb-10 tracking-wide">
              Admin Mode
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {buttons.map(({ name, label }) => (
                <button
                  key={name}
                  onClick={() => setActiveButton(name)}
                  className={`w-full py-3 font-semibold rounded-lg transition
                    ${
                      activeButton === name
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-primary-500 hover:text-primary-400'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-[300px] text-gray-100">{renderContent()}</div>

            <button
              onClick={() => handleLogout('manual')}
              className="mt-12 w-full py-3 font-semibold rounded-lg border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
