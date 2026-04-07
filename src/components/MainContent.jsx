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

      <StudyModal show={!!studyData} onHide={() => setStudyData(null)} data={studyData} />
    </TabPanels>
  );
}
