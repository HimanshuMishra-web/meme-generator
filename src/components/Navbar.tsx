import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface NavbarLink {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
}

interface NavbarProps {
  logo?: React.ReactNode;
  links: NavbarLink[];
  rightContent?: React.ReactNode;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logo, links, className }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className={`flex items-center justify-between py-4 px-8 border-b bg-white sticky top-0 z-10 ${className || ''}`}>
      <div className="flex items-center gap-2">
        {logo}
      </div>
      <div className="flex items-center gap-6">
        {links.map((link, idx) =>
          link.to ? (
            <Link key={idx} to={link.to} className="hover:underline">{link.label}</Link>
          ) : link.href ? (
            <a key={idx} href={link.href} className="hover:underline">{link.label}</a>
          ) : (
            <button key={idx} onClick={link.onClick} className="hover:underline bg-transparent border-none cursor-pointer">{link.label}</button>
          )
        )}
        {isAuthenticated ? (
          <>
            <span className="font-semibold">{user?.username}</span>
            <button
              className="ml-4 bg-gray-200 hover:bg-gray-300 text-black font-semibold px-4 py-2 rounded-full transition"
              onClick={() => { signOut(); navigate('/'); }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="ml-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-full transition">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 