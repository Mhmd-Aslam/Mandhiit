import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow">
      <div className="container-app py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl md:text-2xl tracking-tight flex items-center gap-2">
          <span role="img" aria-label="plate">🍽️</span>
          <span>Best Mandhi in Town</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link to="/" className="hover:text-white/90 font-medium">Home</Link>
            </li>
            <li>
              <a href="#about" className="hover:text-white/90 font-medium">About</a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white/90 font-medium">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
