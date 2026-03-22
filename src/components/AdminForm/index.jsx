import React, { useState, useCallback, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { AlertCircle, LogOut, Clock } from 'lucide-react';
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
const WARNING_THRESHOLD_MS = 60000; // 1 min

const buttons = [
    { name: 'edit', label: 'Edit/Delete' },
    { name: 'review', label: 'Review/Approve' },
    { name: 'download', label: 'Download' },
    { name: 'upload', label: 'Bulk Upload' },
];

export default function AdminForm({ isLoggedIn, setIsLoggedIn }) {
    const [activeButton, setActiveButton] = useState(null);
    const showToast = useToast();

    const handleLogout = useCallback(
        (reason) => {
            setIsLoggedIn(false);

            if (reason === 'inactivity') {
                showToast('Logged out due to inactivity', 'error');
            } else if (reason === 'manual') {
                showToast('Logged out successfully', 'success');
            }
        },
        [setIsLoggedIn, showToast]
    );

    const { remainingTime, resetTimer } = useSessionTimeout(
        () => handleLogout('inactivity'),
        isLoggedIn,
        SESSION_TIMEOUT_MS
    );

    const showWarning = isLoggedIn && remainingTime <= WARNING_THRESHOLD_MS && remainingTime > 0;

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
                                onClick={() => handleLogout('manual')}
                                className="w-full max-w-xs border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                            >
                                Logout
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            {/* Session Timeout Warning Modal */}
            <Transition show={showWarning} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => {}}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-app-surface border border-app-border p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-center gap-3 mb-4 text-secondary-500">
                                        <AlertCircle size={28} />
                                        <DialogTitle as="h3" className="text-xl font-bold text-app-text">
                                            Session Expiring
                                        </DialogTitle>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-app-text-muted">
                                            Your admin session will expire in <span className="font-bold text-secondary-500">{Math.ceil(remainingTime / 1000)}</span> seconds due to inactivity. Do you want to stay logged in?
                                        </p>
                                    </div>

                                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={resetTimer}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            <Clock size={18} />
                                            Stay Logged In
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleLogout('manual')}
                                            className="w-full border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20 flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={18} />
                                            Logout Now
                                        </Button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
