// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MobileHome from './components/MobileHome';
import MobilePayment from './components/MobilePayment';
import MobileActivity from './components/MobileActivity';
import ProtectedRoute from './components/ProtectedRoute';
import { DJProvider } from './components/DJContext';
import { mobileOrDesktop } from './utils/DeviceTypeCheck';
import { getAuth } from 'firebase/auth';

const App: React.FC = () => {
    const isMobile = mobileOrDesktop();
    const auth = getAuth();
    const user = auth.currentUser; // Check if user is authenticated

    return (
        <DJProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Default Route */}
                        <Route
                            path="/"
                            element={
                                isMobile ? (
                                    <Navigate to="/dj/default" />
                                ) : (
                                    user ? <Navigate to={`/dashboard/${user.displayName || 'default'}`} replace /> : <Navigate to="/login" />
                                )
                            }
                        />

                        {/* Redirect /search/:djName to /dj/:djName */}
                        <Route path="search/:djName" element={<RedirectToDJPage />} />

                        {/* Protected DJ-specific Dashboard Route */}
                        <Route
                            path="dashboard/:djName"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Routes */}
                        <Route path="login" element={<Login />} />
                        <Route path="create-account" element={<SignUp />} />

                        {/* Dynamic DJ Routes */}
                        <Route path="dj/:djName" element={<MobileHome />} />
                        <Route path="dj/:djName/payment" element={<MobilePayment />} />
                        <Route path="dj/:djName/activity" element={<MobileActivity />} />

                        {/* Catch-all Route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </DJProvider>
    );
};

export default App;

// RedirectToDJPage component to handle redirection
const RedirectToDJPage: React.FC = () => {
    const { djName } = useParams<{ djName: string }>();

    // Redirect to /dj/djName using Navigate
    return <Navigate to={`/dj/${djName}`} replace />;
};
