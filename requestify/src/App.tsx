// const MobileHomeWithId: React.FC = () => {
//     const { id } = useParams<{ id: string }>(); // Get the id from the URL
//     return <MobileHome id={id} />;
// };

// const MobilePaymentWithId: React.FC = () => {
//     const { id } = useParams<{ id: string }>(); // Get the id from the URL
//     return <MobilePayment id={id} />;
// };

// return (
//         <div className="App">
//             <button onClick={() => setIsSignUp(true)}>Sign Up</button>
//             <button onClick={() => setIsSignUp(false)}>Login</button>
//             {isSignUp ? <SignUp /> : <Login />}
//         </div>
//     );
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MobileHome from './components/MobileHome';
import MobilePayment from './components/MobilePayment';
import MobileActivity from './components/MobileActivity';
import ProtectedRoute from './components/ProtectedRoute';
import Search from './components/Search';
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
                                <Navigate to="/0" />
                            ) : (
                                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                            )
                        }
                    />

                    {/* Protected Dashboard Route */}
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Public Routes */}
                    <Route path="login" element={<Login />} />
                    <Route path="create-account" element={<SignUp />} />

                    {/* Search Route */}
                    <Route path="search/:djName" element={<MobileHome />} />

                    {/* Mobile Routes */}
                    <Route path="0" element={<MobileHome />} />
                    <Route path="0/payment" element={<MobilePayment />} />
                    <Route path="0/activity" element={<MobileActivity />} />

                    {/* Catch-all Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
