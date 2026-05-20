import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import './App.css';

function App() {
    return (
        <MantineProvider defaultColorScheme="light">
            <Router>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </Router>
        </MantineProvider>
    );
}

export default App;
