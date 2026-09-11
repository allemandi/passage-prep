import React, { useCallback } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { Edit, CheckCircle, Download as DownloadIcon, CloudUpload } from 'lucide-react';
import Login from './AdminForm/Login';
import QuestionManager from './AdminForm/QuestionManager';
import Upload from './AdminForm/Upload';
import Download from './AdminForm/Download';

import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';

const buttons = [
    { name: 'edit', label: 'Edit/Delete', icon: Edit },
    { name: 'review', label: 'Review/Approve', icon: CheckCircle },
    { name: 'download', label: 'Download', icon: DownloadIcon },
    { name: 'upload', label: 'Bulk Upload', icon: CloudUpload },
];

export default function AdminForm({ isLoggedIn, setIsLoggedIn }) {
    const handleLogout = useCallback(() => {
        setIsLoggedIn(false);
    }, [setIsLoggedIn]);

    return (
        <div className="w-full">
            <Card className="flex flex-col gap-10">
                {!isLoggedIn ? (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-app-border/80 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white font-bold text-sm flex-shrink-0 shadow-2xs">
                                    ⚙️
                                </span>
                                <SectionHeader centered={false} className="!mb-0 !border-b-0 !pb-0 text-xl sm:text-2xl">
                                    Admin Dashboard
                                </SectionHeader>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                size="sm"
                                className="border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20 font-semibold"
                            >
                                Logout
                            </Button>
                        </div>

                        <TabGroup>
                            <TabList className="flex flex-wrap gap-2 p-1.5 bg-secondary-50/60 dark:bg-stone-900/50 rounded-xl border border-app-border shadow-2xs">
                                {buttons.map(({ name, label, icon: Icon }) => (
                                    <Tab
                                        key={name}
                                        className={({ selected }) =>
                                            clsx(
                                                'flex-grow flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                                                selected
                                                    ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-500'
                                                    : 'text-app-text-muted hover:bg-app-surface hover:text-app-text'
                                            )
                                        }
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels className="mt-8 min-h-[400px]">
                                <TabPanel>
                                    <QuestionManager title="Filter for Editing/Deleting Questions" />
                                </TabPanel>
                                <TabPanel>
                                    <QuestionManager title="Filter for Reviewing/Approving Questions" showApproveAction />
                                </TabPanel>
                                <TabPanel><Download /></TabPanel>
                                <TabPanel><Upload /></TabPanel>
                            </TabPanels>
                        </TabGroup>
                    </>
                )}
            </Card>
        </div>
    )
}
