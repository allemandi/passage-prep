import React, { useState, useEffect, useCallback } from 'react';
import useSessionTimeout from './useSessionTimeout';
import Login from './Login';
import ReviewApprove from './ReviewApprove';
import Upload from './Upload';
import EditDelete from './EditDelete';
import Download from './Download';

import { useToast } from '../ToastMessage/Toast';

const SESSION_TIMEOUT_MS = 300000; // 5 mins

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
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16 bg-white dark:bg-gray-900 min-h-screen">
            <div
                className="
      bg-white/50 dark:bg-gray-900/60
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm backdrop-blur-md
      p-8
      flex flex-col gap-10
    "
            >
                {!isLoggedIn ? (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                ) : (
                    <>
                        <h2
                            className="
            text-3xl font-semibold
            text-sky-700 dark:text-sky-400
            border-b-2 border-sky-700 dark:border-sky-400
            pb-2 mb-10
            tracking-wide
            text-center sm:text-left
          "
                        >
                            Admin Mode
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            {buttons.map(({ name, label }) => (
                                <button
                                    key={name}
                                    onClick={() => setActiveButton(name)}
                                    className={`
                w-full py-3 font-semibold rounded-lg transition
                ${activeButton === name
                                            ? 'bg-sky-600 text-white shadow-md'
                                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-700/30 hover:border-sky-600 hover:text-sky-600'
                                        }
                focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
              `}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[300px] text-gray-900 dark:text-gray-300 mb-4">
                            {renderContent()}
                        </div>

                        <button
                            onClick={() => handleLogout('manual')}
                            className="
            mt-12 w-full py-3 font-semibold rounded-lg
            border border-sky-600 text-sky-600
            hover:bg-sky-100 dark:hover:bg-sky-700/30 hover:text-white
            transition
            focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
          "
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
