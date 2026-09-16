import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  LogOut, 
  User as UserIcon,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole, StudentProfile, Mentor, Gig, PassportRecord } from '../types';
import { GlobalOmniSearch } from './GlobalOmniSearch';

interface TopbarProps {
  currentRole: UserRole;
  student: StudentProfile | null;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenTrust: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigateTab?: (tab: string) => void;
  onSelectGig?: (gig: Gig) => void;
  onSelectMentor?: (mentor: Mentor) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  gigs?: Gig[];
  mentors?: Mentor[];
  passport?: PassportRecord[];
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRoleChange?: (role: UserRole) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRole,
  student,
  unreadCount,
  onOpenNotifications,
  onOpenTrust,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  searchQuery,
  setSearchQuery,
  onNavigateTab = () => {},
  onSelectGig,
  onSelectMentor,
  onShowToast,
  gigs,
  mentors,
  passport,
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onToggleCollapse,
  onRoleChange,
  theme = 'dark',
  onToggleTheme
}) => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return localStorage.getItem('profilePhoto');
  });

  // Synchronize photo across storage events
  useEffect(() => {
    const updatePhoto = () => {
      setProfilePhoto(localStorage.getItem('profilePhoto'));
    };
    window.addEventListener('storage', updatePhoto);
    const interval = setInterval(updatePhoto, 1000);
    return () => {
      window.removeEventListener('storage', updatePhoto);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 shrink-0 bg-[#B39F84] border-b border-[#2B2520]/15 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 select-none min-w-0 text-[#2B2520]">
      {/* Left section: Avatar Icon + Hamburger / Collapse + Global OmniSearch */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl min-w-0">
        {/* Mobile Hamburger Toggle */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-[#D6CCA8] border border-[#2B2520]/20 text-[#2B2520] hover:text-black hover:border-[#2B2520] shrink-0 cursor-pointer shadow-xs"
            title="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Desktop Sidebar Toggle when collapsed */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-2 rounded-xl bg-[#D6CCA8] border border-[#2B2520]/20 text-[#2B2520] hover:text-black hover:border-[#2B2520] transition-colors shrink-0 cursor-pointer shadow-xs"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-[#2B2520]" /> : <PanelLeftClose className="w-4 h-4 text-[#2B2520]" />}
          </button>
        )}

        {/* TOP HEADER - LEFT AVATAR ICON */}
        <div
          onClick={onOpenProfile}
          className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] rounded-full flex items-center justify-center overflow-hidden shrink-0 cursor-pointer shadow-sm border-2 border-[#2B2520]/30 hover:border-[#2B2520] transition-all bg-[#D6CCA8]"
          title="Open Profile Drawer"
        >
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D6CCA8] flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-[#2B2520]" />
            </div>
          )}
        </div>

        {/* Full Interactive OmniSearch Bar for all 4 Portals */}
        <GlobalOmniSearch
          currentRole={currentRole}
          student={student}
          gigs={gigs}
          mentors={mentors}
          passport={passport}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateTab={onNavigateTab}
          onSelectGig={onSelectGig}
          onSelectMentor={onSelectMentor}
          onShowToast={onShowToast}
        />
      </div>

      {/* Right action controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
        {/* Light / Dark Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[#D6CCA8] border border-[#2B2520]/20 hover:border-[#2B2520] text-[#2B2520] hover:text-black transition-all shrink-0 cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#2B2520] animate-in spin-in-180 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#2B2520] animate-in spin-in-180 duration-300" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-[#D6CCA8] border border-[#2B2520]/20 hover:border-[#2B2520] text-[#2B2520] hover:text-black transition-colors shrink-0 cursor-pointer shadow-xs"
          title="Notification Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#B39F84] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Logout Quick Action */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-[#D6CCA8] border border-[#2B2520]/20 hover:border-[#2B2520] text-[#2B2520]/80 hover:text-black transition-colors shrink-0 cursor-pointer shadow-xs"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

