import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, TabGroup } from '@headlessui/react';
import { AlertCircle, LogOut, Clock } from 'lucide-react';

import { ToastProvider, useToast } from './components/ToastMessage/Toast';
import Header from './components/Header';
import Tabs from './components/Tabs';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import Button from './components/ui/Button';

import { getBooks } from './services/dataService';
import { useDarkMode } from './components/useDarkMode';
import useSessionTimeout from './hooks/useSessionTimeout';

const authChannel = new BroadcastChannel('auth');
const SESSION_TIMEOUT_MS = 300000; // 5 mins
const WARNING_THRESHOLD_MS = 60000; // 1 min

function AppContent() {
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [mode, setMode] = useDarkMode();
  const [helpOpen, setHelpOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isLoggedIn') === 'true');
  const showToast = useToast();

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

  const handleSetIsLoggedIn = useCallback((value) => {
    setIsLoggedIn(value);
    if (value) {
      sessionStorage.setItem('isLoggedIn', 'true');
      authChannel.postMessage({ type: 'LOGIN' });
    } else {
      sessionStorage.removeItem('isLoggedIn');
      authChannel.postMessage({ type: 'LOGOUT' });
    }
  }, []);

  const handleLogout = useCallback(
    (reason) => {
      handleSetIsLoggedIn(false);

      if (reason === 'inactivity') {
        showToast('Logged out due to inactivity', 'error');
      } else if (reason === 'manual') {
        showToast('Logged out successfully', 'success');
      }
    },
    [handleSetIsLoggedIn, showToast]
  );

  const { remainingTime, resetTimer } = useSessionTimeout(
    () => handleLogout('inactivity'),
    isLoggedIn,
    SESSION_TIMEOUT_MS
  );

  const showWarning = isLoggedIn && remainingTime <= WARNING_THRESHOLD_MS && remainingTime > 0;

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'LOGIN') {
        setIsLoggedIn(true);
        sessionStorage.setItem('isLoggedIn', 'true');
      } else if (event.data.type === 'LOGOUT') {
        setIsLoggedIn(false);
        sessionStorage.removeItem('isLoggedIn');
      }
    };

    authChannel.addEventListener('message', handleMessage);

    return () => {
      authChannel.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-text transition-colors duration-500">
      <Header mode={mode} setMode={setMode} />

      <main className="flex-grow w-full pb-24">
        <TabGroup selectedIndex={tabValue} onChange={setTabValue}>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
            <Tabs />

            <MainContent
              isLoading={isLoading}
              handleShowStudy={handleShowStudy}
              studyData={studyData}
              setStudyData={setStudyData}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={handleSetIsLoggedIn}
            />
          </div>
        </TabGroup>
      </main>

      <Footer onHelpClick={() => setHelpOpen(true)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Global Session Timeout Warning Modal */}
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
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
