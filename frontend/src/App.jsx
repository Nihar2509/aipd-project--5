
import { useEffect, useState } from 'react';
import './App.css';

import { checkServer } from './services/healthService';

import Faculty from './components/Faculty';
import Examinations from './components/Examinations';
import Rooms from './components/Rooms';
import FacultyAvailability from './components/FacultyAvailability';
import RoomAllocation from './components/RoomAllocation';
import DutyAllocation from './components/DutyAllocation';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [serverError, setServerError] = useState('');

  const menuItems = [
    'Dashboard',
    'Faculty',
    'Examinations',
    'Rooms',
    'Room Allocation',
    'Faculty Availability',
    'Duty Allocation',
    'Reports'
  ];

  useEffect(() => {
    checkServer()
      .then((data) => {
        setServerStatus(data.status);
        setServerError('');
      })
      .catch(() => {
        setServerStatus('Disconnected');
        setServerError('Backend server is not responding.');
      });
  }, []);

  const renderPage = () => {
    if (activePage === 'Dashboard') {
      return (
        <>
          <div className="welcome-section">
            <h1>Welcome to Exam Roster Management</h1>
            <p>
              Manage examinations, faculty and examination
              duties from one place.
            </p>
          </div>

          <div className="server-status">
            <strong>Backend connection:</strong>{' '}
            <span
              className={
                serverStatus === 'Healthy'
                  ? 'status-success'
                  : 'status-error'
              }
            >
              {serverStatus}
            </span>

            {serverError && <p>{serverError}</p>}
          </div>

          <div className="section-heading">
            <h2>System Modules</h2>
            <p>Select a module from the sidebar to continue.</p>
          </div>

          <div className="module-grid">
            {menuItems.slice(1).map((item) => (
              <div className="module-card" key={item}>
                <h3>{item}</h3>
                <p>Manage {item.toLowerCase()} in the system.</p>

                <button onClick={() => setActivePage(item)}>
                  Open Module
                </button>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activePage === 'Faculty') {
      return <Faculty />;
    }

    if (activePage === 'Examinations') {
      return <Examinations />;
    }

    if (activePage === 'Rooms') {
      return <Rooms />;
    }

    if (activePage === 'Faculty Availability') {
      return <FacultyAvailability />;
    }

    if (activePage === 'Room Allocation') {
      return <RoomAllocation />;
    }

    if (activePage === 'Duty Allocation') {
      return <DutyAllocation />;
    }

    return (
      <div className="empty-page">
        <h2>{activePage}</h2>
        <p>
          This module will be developed in the upcoming steps.
        </p>
      </div>
    );
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <h2>Exam Roster</h2>
          <p>Management System</p>
        </div>

        <div className="menu">
          <p className="menu-heading">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activePage === item
                  ? 'menu-item active'
                  : 'menu-item'
              }
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>Exam Roster Management</p>
          <small>University Administration</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h3>{activePage}</h3>
            <p>Intelligent Exam Duty Allocation System</p>
          </div>

          <div className="admin-info">
            <div className="admin-avatar">A</div>
            <span>Administrator</span>
          </div>
        </header>

        <section className="page-content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default App;
