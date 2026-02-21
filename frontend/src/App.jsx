import { Route, Routes, Navigate } from 'react-router';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import CallPage from './pages/CallPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PageLoader from './components/PageLoader.jsx';
import IncomingCallModal from './components/IncomingCallModal.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { Toaster } from 'react-hot-toast';
import { useAuthUser } from './hooks/useAuthUser.js';

const ProtectedRoutes = () => {
  return (
    <CallProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <IncomingCallModal />
    </CallProvider>
  );
};

const App = () => {
  const { isLoading, authUser } = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/*" element={authUser ? <ProtectedRoutes /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;