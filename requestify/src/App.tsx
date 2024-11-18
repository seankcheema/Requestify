// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MobileHome from './components/MobileHome';
import MobilePayment from './components/MobilePayment';
import MobileActivity from './components/MobileActivity';
import MobileMessage from './components/MobileMessage';
import ProtectedRoute from './components/ProtectedRoute';
import { DJProvider } from './components/DJContext';
import { UserProvider } from './components/UserContext'; // Import UserProvider
import { mobileOrDesktop } from './utils/DeviceTypeCheck';
import { getAuth } from 'firebase/auth';

const App: React.FC = () => {
    const isMobile = mobileOrDesktop();
    const auth = getAuth();
    const user = auth.currentUser; // Check if user is authenticated

    return (
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
                                user ? (
                                    <Navigate to={`/dashboard/${user.displayName || 'default'}`} replace />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            )
                        }
                    />

                    {/* Redirect /search/:djName to /dj/:djName */}
                    <Route path="search/:djName" element={<RedirectToDJPage />} />

                    {/* DJ-Specific Protected Routes (Wrapped in DJProvider) */}
                    <Route
                        path="dashboard/:djName"
                        element={
                            <DJProvider>
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            </DJProvider>
                        }
                    />

                    {/* Public Routes */}
                    <Route path="login" element={<Login />} />
                    <Route path="create-account" element={<SignUp />} />

                    {/* End-User Routes (Wrapped in UserProvider) */}
                    <Route
                        path="dj/:djName"
                        element={
                            <UserProvider>
                                <MobileHome />
                            </UserProvider>
                        }
                    />
                    <Route
                        path="dj/:djName/payment"
                        element={
                            <UserProvider>
                                <MobilePayment />
                            </UserProvider>
                        }
                    />
                    <Route
                        path="dj/:djName/activity"
                        element={
                            <UserProvider>
                                <MobileActivity />
                            </UserProvider>
                        }
                    />
                    <Route
                        path="dj/:djName/message"
                        element={
                            <UserProvider>
                                <MobileMessage />
                            </UserProvider>
                        }
                    />

                    {/* Catch-all Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;

// RedirectToDJPage component to handle redirection
const RedirectToDJPage: React.FC = () => {
    const { djName } = useParams<{ djName: string }>();

    // Redirect to /dj/djName using Navigate
    return <Navigate to={`/dj/${djName}`} replace />;
};
