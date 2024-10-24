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
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MobileHome from './components/MobileHome';
import MobilePayment from './components/MobilePayment';
import MobileActivity from './components/MobileActivity';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/*Can only access the dashboard if logged in!*/}
                    <Route 
                        path="dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/*Routes anyone can access from Desktop or Mobile*/}
                    <Route path="login" element={<Login />} />
                    <Route path="create-account" element={<SignUp />} />
                    <Route path="0" element={<MobileHome />} />
                    <Route path="0/payment" element={<MobilePayment />} />
                    <Route path="0/activity" element={<MobileActivity />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
