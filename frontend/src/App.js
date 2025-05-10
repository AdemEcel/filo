import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AuthContext from './context/AuthContext';
import { useContext } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import MaintenanceHistory from "./components/MaintenanceHistory";
import VehicleList from "./components/VehicleList";

function App() {
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={tr}
        >
            <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
                <Route
                />
                <Route
                    path="/*"
                    element={
                        isAuthenticated ? <HomePage /> : <Navigate to="/login" />
                    }
                />
            </Routes>
        </LocalizationProvider>
    );
}

export default App;