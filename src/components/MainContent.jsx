import { TabPanels, TabPanel } from '@headlessui/react';
import RequestForm from './RequestForm';
import ContributeForm from './ContributeForm';
import StudyModal from './StudyModal';

export default function MainContent({
  isLoading,
  handleShowStudy,
  studyData,
  setStudyData,
  setTabValue
}) {
  return (
    <TabPanels className="w-full">
      <TabPanel className="focus:outline-none transition-all duration-300">
        <RequestForm
          onStudyGenerated={handleShowStudy}
          isLoading={isLoading}
          setTabValue={setTabValue}
        />
      </TabPanel>
      <TabPanel className="focus:outline-none transition-all duration-300">
        <ContributeForm isLoading={isLoading} />
      </TabPanel>

      <StudyModal show={!!studyData} onHide={() => setStudyData(null)} data={studyData} />
    </TabPanels>
  );
}
