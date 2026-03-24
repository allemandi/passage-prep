import React, { useState, useCallback } from 'react';
import Login from './AdminForm/Login';
import ReviewApprove from './AdminForm/ReviewApprove';
import Upload from './AdminForm/Upload';
import EditDelete from './AdminForm/EditDelete';
import Download from './AdminForm/Download';

import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';

const buttons = [
    { name: 'edit', label: 'Edit/Delete' },
    { name: 'review', label: 'Review/Approve' },
    { name: 'download', label: 'Download' },
    { name: 'upload', label: 'Bulk Upload' },
];

export default function AdminForm({ isLoggedIn, setIsLoggedIn }) {
    const [activeButton, setActiveButton] = useState(null);

    const handleLogout = useCallback(() => {
        setIsLoggedIn(false);
    }, [setIsLoggedIn]);

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
        <div className="w-full">
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
                                onClick={handleLogout}
                                className="w-full max-w-xs border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
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
