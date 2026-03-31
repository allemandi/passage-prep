import { TabPanels, TabPanel } from '@headlessui/react';
import RequestForm from './RequestForm';
import ContributeForm from './ContributeForm';
import AdminPanel from './AdminPanel';
import StudyModal from './StudyModal';

export default function MainContent({
  isLoading,
  handleShowStudy,
  studyData,
  setStudyData,
  isLoggedIn,
  setIsLoggedIn,
  setTabValue
}) {
  return (
    <TabPanels
      className="w-full transition-colors duration-300"
    >
      <TabPanel>
        <RequestForm
          onStudyGenerated={handleShowStudy}
          isLoading={isLoading}
          setTabValue={setTabValue}
        />
      </TabPanel>
      <TabPanel>
        <ContributeForm isLoading={isLoading} />
      </TabPanel>
      <TabPanel>
        <AdminPanel isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </TabPanel>

      <StudyModal show={!!studyData} onHide={() => setStudyData(null)} data={studyData} />
    </TabPanels>
  );
}
