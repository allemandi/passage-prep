import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './components/ToastMessage/Toast';
import Header from './components/Header';
import Tabs from './components/Tabs';
import MainContent from './components';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { getBooks } from './services/dataService';
import { useDarkMode } from './components/useDarkMode';

function App() {
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [mode, setMode] = useDarkMode();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      await getBooks();
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const handleShowStudy = useCallback((data) => {
    setStudyData(data);
  }, []);

  useEffect(() => {
    const authChannel = new BroadcastChannel('auth');
    const handleTabChange = () => {
      authChannel.postMessage({ type: 'LOGOUT' });
    };
    window.addEventListener('beforeunload', handleTabChange);
    return () => {
      window.removeEventListener('beforeunload', handleTabChange);
      authChannel.close();
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header mode={mode} setMode={setMode} />

        <main className="flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div className="px-4 sm:px-6 md:px-8 py-8 min-h-screen flex flex-col">
            <Tabs tabValue={tabValue} setTabValue={setTabValue} />

            <MainContent
              tabValue={tabValue}
              isLoading={isLoading}
              handleShowStudy={handleShowStudy}
              studyData={studyData}
              setStudyData={setStudyData}
            />
          </div>
        </main>

        <Footer onHelpClick={() => setHelpOpen(true)} />

        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </ToastProvider>
  );
}

export default App;
