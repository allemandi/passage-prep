import RequestForm from './RequestForm';
import ContributeForm from './ContributeForm';
import AdminForm from './AdminForm';
import StudyModal from './StudyModal';

export default function MainContent({
  tabValue,
  isLoading,
  handleShowStudy,
  studyData,
  setStudyData,
  isLoggedIn,
  setIsLoggedIn
}) {
  return (
    <section
      className="w-full transition-colors duration-300"
      role="tabpanel"
      id={`tabpanel-${tabValue}`}
      aria-labelledby={`tab-${tabValue}`}
    >
      {tabValue === 0 && <RequestForm onStudyGenerated={handleShowStudy} isLoading={isLoading} />}
      {tabValue === 1 && <ContributeForm isLoading={isLoading} />}
      {tabValue === 2 && <AdminForm isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}

      <StudyModal show={!!studyData} onHide={() => setStudyData(null)} data={studyData} />
    </section>
  );
}
