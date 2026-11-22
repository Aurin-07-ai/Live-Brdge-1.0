import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import AccessibilityBar from './components/AccessibilityBar';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const CarePlanPage = lazy(() => import('./pages/CarePlanPage'));
const UnderstandingCheckPage = lazy(() => import('./pages/UnderstandingCheckPage'));
const DoctorQuestionsPage = lazy(() => import('./pages/DoctorQuestionsPage'));
const DoctorPanelPage = lazy(() => import('./pages/DoctorPanelPage'));

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-alabaster text-charcoal">
          <Navbar />
          <main className="flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-warm text-sm font-semibold">Loading LiveBridge AI…</p>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/care-plan" element={<CarePlanPage />} />
                <Route path="/understanding-check" element={<UnderstandingCheckPage />} />
                <Route path="/doctor-questions" element={<DoctorQuestionsPage />} />
                <Route path="/doctor-panel" element={<DoctorPanelPage />} />
              </Routes>
            </Suspense>
          </main>
          <AccessibilityBar />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
