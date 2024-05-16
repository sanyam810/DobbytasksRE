import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';

const InitialRedirect = () => {
    return <Navigate to="/login" />;
};

  const App = () => {
    return (
        <div className="App bg">
          <Router>
            <Routes>
              <Route path="/" element={<InitialRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </Router>
        </div>
      );
};

export default App;  
