// UN-Compliant Header Component
import React from 'react';
import './UNHeader.css';

interface UNHeaderProps {
  activeTab: 'llm' | 'queue' | 'reports';
  onTabChange: (tab: 'llm' | 'queue' | 'reports') => void;
}

export const UNHeader: React.FC<UNHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="un-header" role="banner">
      <div className="un-header-main">
        <div className="un-header-left">
          <div className="un-emblem-container">
            <div className="un-emblem">
              <svg viewBox="0 0 100 100" className="un-emblem-svg" aria-label="United Nations emblem">
                <circle cx="50" cy="50" r="45" fill="#009EDB" stroke="#ffffff" strokeWidth="2"/>
                <g fill="#ffffff">
                  <path d="M50 15 L60 35 L80 35 L65 50 L70 70 L50 55 L30 70 L35 50 L20 35 L40 35 Z"/>
                  <circle cx="50" cy="50" r="8" fill="#009EDB"/>
                </g>
              </svg>
            </div>
            <div className="un-emblem-clear-space"></div>
          </div>
          <div className="un-title-container">
            <h1 className="un-title">UNICC AI Safety</h1>
            <p className="un-subtitle">United Nations International Computing Centre</p>
          </div>
        </div>
        
        <nav className="un-nav" role="navigation" aria-label="Main navigation">
          <ul className="un-nav-list">
            <li>
              <button
                className={`un-nav-item ${activeTab === 'llm' ? 'active' : ''}`}
                onClick={() => onTabChange('llm')}
                aria-current={activeTab === 'llm' ? 'page' : undefined}
              >
                <span className="un-nav-icon">🤖</span>
                AI Assistant
              </button>
            </li>
            <li>
              <button
                className={`un-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
                onClick={() => onTabChange('queue')}
                aria-current={activeTab === 'queue' ? 'page' : undefined}
              >
                <span className="un-nav-icon">📋</span>
                Queue
              </button>
            </li>
            <li>
              <button
                className={`un-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => onTabChange('reports')}
                aria-current={activeTab === 'reports' ? 'page' : undefined}
              >
                <span className="un-nav-icon">📊</span>
                Reports
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="un-header-right">
          <div className="un-user-menu">
            <button className="un-user-button" aria-label="User menu">
              <span className="un-user-avatar">👤</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="un-header-secondary">
        <div className="un-context-bar">
          <div className="un-stats">
            <span className="un-stat">
              <span className="un-stat-label">Active Reviews:</span>
              <span className="un-stat-value">12</span>
            </span>
            <span className="un-stat">
              <span className="un-stat-label">Pending:</span>
              <span className="un-stat-value">3</span>
            </span>
            <span className="un-stat">
              <span className="un-stat-label">Completed Today:</span>
              <span className="un-stat-value">47</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
