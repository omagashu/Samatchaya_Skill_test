import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import InputForm from './components/InputForm';
import Report from './components/Report';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

const App = () => {
  const location = useLocation(); 

  return (
    <>
          {location.pathname === '/' && (
             <div className="classes.button">
              <Link to="/report">
            <button 
              type="button" 
              className="center btn btn-danger wide-button" 
              size="lg"
            >
              Go to Report
            </button>
             </Link>
            </div>
          )}

      <Routes>
        <Route path="/" element={<InputForm />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </>
  );
};

const MainApp = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default MainApp;
