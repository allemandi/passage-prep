import React, { useState, useEffect, useCallback } from 'react';
import useSessionTimeout from './useSessionTimeout';
import Login from './Login';
import ReviewApprove from './ReviewApprove';
import Upload from './Upload';
import EditDelete from './EditDelete';
import Download from './Download';

import { useToast } from '../ToastMessage/Toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="flex flex-col gap-10">
                {!isLoggedIn ? (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                ) : (
                    <>
                        <SectionHeader centered={false}>Admin Mode</SectionHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {buttons.map(({ name, label }) => (
                                <Button
                                    key={name}
                                    variant={activeButton === name ? 'primary' : 'outline'}
                                    onClick={() => setActiveButton(name)}
                                    className="w-full"
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>

                        <div className="min-h-[300px] text-gray-900 dark:text-gray-300 mb-4">
                            {renderContent()}
                        </div>

                        <div className="flex justify-center mt-12">
                            <Button
                                variant="outline"
                                onClick={() => handleLogout('manual')}
                                className="w-full max-w-xs border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Logout
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
