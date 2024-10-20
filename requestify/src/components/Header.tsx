import React from 'react';
import './Dashboard.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="header-logo" />
    </header>
  );
}

export default Header;
