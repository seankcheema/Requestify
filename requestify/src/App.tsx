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
import { mobileOrDesktop } from './utils/DeviceTypeCheck';

const App: React.FC = () => {
    //Checks if user is on a phone or desktop
    const isMobile = mobileOrDesktop();

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* If the user is on mobile, redirects "/" to the mobile home route*/}
                    <Route 
                        path="/" 
                        element={isMobile ? <Navigate to="/0" /> : <Navigate to="/dashboard" />} 
                    />

                    {/*Protected Dashboard Route for Logged in Users Only */}
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/*Public Routes for Authentication*/}
                    <Route path="login" element={<Login />} />
                    <Route path="create-account" element={<SignUp />} />

                    {/*Routes for Mobile*/}
                    <Route path="0" element={<MobileHome />} />
                    <Route path="0/payment" element={<MobilePayment />} />
                    <Route path="0/activity" element={<MobileActivity />} />

                    {/*Catch-all that redirects any unknown routes to the correct homepage*/}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
