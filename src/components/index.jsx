import RequestForm from './RequestForm';
import ContributeForm from './ContributeForm';
import AdminForm from './AdminForm';
import StudyModal from './StudyModal';

export default function MainContent({ tabValue, isLoading, handleShowStudy, studyData, setStudyData }) {
  return (
    <section
      className="
        w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8
        bg-lightBg text-lightText
        dark:bg-darkBg dark:text-darkText
        transition-colors duration-300
      "
      role="tabpanel"
      id={`tabpanel-${tabValue}`}
      aria-labelledby={`tab-${tabValue}`}
    >
      {tabValue === 0 && <RequestForm onStudyGenerated={handleShowStudy} isLoading={isLoading} />}
      {tabValue === 1 && <ContributeForm isLoading={isLoading} />}
      {tabValue === 2 && <AdminForm />}

      <StudyModal show={!!studyData} onHide={() => setStudyData(null)} data={studyData} />
    </section>
  );
}
