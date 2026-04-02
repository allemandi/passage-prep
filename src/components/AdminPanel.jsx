import React, { useCallback, Fragment } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
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
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-2 border-app-border pb-6">
                            <SectionHeader centered={false} className="!mb-0 !border-b-0 !pb-0">Admin Mode</SectionHeader>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                size="sm"
                                className="border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                            >
                                Logout
                            </Button>
                        </div>

                        <TabGroup>
                            <TabList className="flex flex-wrap gap-2 p-1 bg-app-bg/50 rounded-xl border-2 border-app-border">
                                {buttons.map(({ name, label }) => (
                                    <Tab
                                        key={name}
                                        className={({ selected }) =>
                                            clsx(
                                                'flex-grow px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                selected
                                                    ? 'bg-primary-500 text-white shadow-md'
                                                    : 'text-app-text-muted hover:bg-app-surface hover:text-app-text'
                                            )
                                        }
                                    >
                                        {label}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels className="mt-8 min-h-[400px]">
                                <TabPanel><EditDelete /></TabPanel>
                                <TabPanel><ReviewApprove /></TabPanel>
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
