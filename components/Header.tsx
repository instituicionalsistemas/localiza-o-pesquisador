import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { useLanguage, Language } from '../contexts/ThemeContext';

const BrazilFlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
        <path fill="#009639" d="M0 0h9v6H0z"/>
        <path fill="#FEDF00" d="M4.5 1.223L1.253 3l3.247 1.777L7.747 3z"/>
        <circle cx="4.5" cy="3" r="1.06" fill="#002776"/>
    </svg>
);

const UsaFlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
        <path fill="#B22234" d="M0 0h9v6H0z"/>
        <path fill="#fff" d="M0 1h9v1H0zm0 2h9v1H0zm0 2h9v1H0z"/>
        <path fill="#3C3B6E" d="M0 0h4v3H0z"/>
        <path fill="#fff" d="M.4 2.6h.4L1 .4l.2.2-.6.6h.6l-.2.2.6.6-.2.2-.6-.6-.2.2.6-.6h-.6l.2-.2-.6-.6.2-.2.6.6zM2 2.6h.4L2.6 .4l.2.2-.6.6h.6l-.2.2.6.6-.2.2-.6-.6-.2.2.6-.6h-.6l.2-.2-.6-.6.2-.2.6.6zM3.6 2.6h.4L4.2 .4l.2.2-.6.6h.6l-.2.2.6.6-.2.2-.6-.6-.2.2.6-.6h-.6l.2-.2-.6-.6.2-.2.6.6zM1.2 2.2h.4l.2-.2-.6-.6.2-.2.6.6V.4l.2.2-.6.6h.6l-.2.2.6.6-.2.2-.6-.6zM2.8 2.2h.4l.2-.2-.6-.6.2-.2.6.6V.4l.2.2-.6.6h.6l-.2.2.6.6-.2.2-.6-.6z"/>
    </svg>
);

const SpainFlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
        <path fill="#C60B1E" d="M0 0h9v6H0z"/>
        <path fill="#FFC400" d="M0 1.5h9v3H0z"/>
    </svg>
);

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; icon: React.FC<any> }[] = [
        { code: 'pt', icon: BrazilFlagIcon },
        { code: 'en', icon: UsaFlagIcon },
        { code: 'es', icon: SpainFlagIcon },
    ];

    return (
        <div className="flex items-center gap-3">
            {languages.map(({ code, icon: Icon }) => (
                <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`rounded-full transition-all duration-200 focus:outline-none ${language === code ? 'ring-2 ring-offset-2 ring-light-primary ring-offset-light-background dark:ring-offset-dark-card' : 'hover:opacity-75'}`}
                    aria-label={`Change language to ${code}`}
                >
                    <Icon className="w-8 h-5 rounded-full block" />
                </button>
            ))}
        </div>
    );
};


const Header: React.FC<{ title: string; onToggleSidebar?: () => void }> = ({ title, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };
  
  const getProfileLink = () => {
      if (!user) return '/';
      switch(user.role) {
          case 'admin': return '/admin/profile';
          case 'user': return '/user/profile';
          case 'company': return '/company/profile';
          default: return '/';
      }
  }

  return (
    <header className="bg-light-background dark:bg-dark-card text-light-text dark:text-dark-text shadow-md p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="md:hidden p-1 text-light-text dark:text-dark-text">
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        <img 
          src="https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/imagens/LOGO%20TRIAD3%20.png" 
          alt="Triad3 Logo" 
          className="h-10 w-10 rounded-full"
        />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && user.role === 'user' && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400" title="Rastreamento em tempo real ativo">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="hidden sm:block">{t('active')}</span>
            </div>
        )}
        {user && user.role === 'user' && <LanguageSwitcher />}
        <ThemeToggle />
        {user && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-background">
                <img src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="user avatar" className="h-8 w-8 rounded-full object-cover bg-gray-200" />
                <span className="hidden sm:block font-medium">{user.name}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-light-background dark:bg-dark-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to={getProfileLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-background"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    {t('myProfile')}
                  </Link>
                   <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-background"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;