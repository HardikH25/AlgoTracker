import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

// Load each page only when the user visits it (saves load time)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Topics = lazy(() => import('./pages/Topics'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));
const ProblemLogger = lazy(() => import('./pages/ProblemLogger'));
const Starred = lazy(() => import('./pages/Starred'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Spinning circle shown while a page is loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col font-sans selection:bg-zinc-800">

          <Navbar />

          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Pages anyone can visit */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Pages only logged-in users can visit */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topics"
                  element={
                    <ProtectedRoute>
                      <Topics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topics/:topicName"
                  element={
                    <ProtectedRoute>
                      <TopicDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/log"
                  element={
                    <ProtectedRoute>
                      <ProblemLogger />
                    </ProtectedRoute>
                  }
                />
                {/* Same page but with a problem ID for editing */}
                <Route
                  path="/log/:id"
                  element={
                    <ProtectedRoute>
                      <ProblemLogger />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/starred"
                  element={
                    <ProtectedRoute>
                      <Starred />
                    </ProtectedRoute>
                  }
                />

                {/* If the user types a random URL, send them home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
