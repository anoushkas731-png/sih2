import React, { useState } from 'react';
import { 
  Compass, 
  Cpu, 
  Terminal, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Repeat, 
  Award, 
  UserCheck, 
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LogOut,
  User as UserIcon,
  X,
  GraduationCap,
  BriefcaseBusiness,
  Building,
  Building2,
  Menu,
  Lock,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { UserRole, StudentProfile } from '../types';
import { Logo } from './Logo';
import { ConnectedAccounts } from './ConnectedAccounts';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  student: StudentProfile | null;
  onRoleChange: (role: UserRole) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  student,
  onRoleChange,
  onOpenProfile,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'SB';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    setShowRoleMenu(false);
    if (onCloseMobile) onCloseMobile();
  };

  // Render Inner Sidebar Content (parameterized by whether it's collapsed or in drawer)
  const renderContent = (collapsed: boolean, isDrawer = false) => {
    const navBtnClass = (tabKey: string) => `w-full flex items-center ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0 py-0 gap-0' : 'gap-3 px-2.5 py-2'} rounded-xl text-[13px] font-semibold transition-all ${
      activeTab === tabKey
        ? 'bg-[#D6CCA8] text-[#2B2520] shadow-sm font-bold sidebar-active-btn border border-[#2B2520]/20 [&_*]:!text-[#2B2520]'
        : 'text-[#2B2520]/80 hover:bg-[#C2B095] hover:text-[#2B2520] [&_*]:text-[#2B2520]'
    }`;

    return (
      <div className="flex flex-col h-full bg-[#B39F84] border-r border-[#2B2520]/15 select-none text-[#2B2520]">
        {/* Brand Header */}
        <div className={`px-4 py-4 border-b border-[#2B2520]/15 bg-[#B39F84] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Logo showText={!collapsed} subtitle={!collapsed} iconSize={36} />

          {/* Close button for mobile drawer */}
          {isDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl bg-[#D6CCA8] text-[#2B2520] hover:text-black border border-[#2B2520]/20 transition-colors shadow-xs"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse Button */}
          {!isDrawer && onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-xl text-[#2B2520]/70 hover:text-black hover:bg-[#C2B095] transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ACTIVE ROLE (Locked) */}
        {!collapsed ? (
          <div className="px-3.5 pt-3.5 pb-2.5">
            <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#D6CCA8] border border-[#2B2520]/20 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Green dot pulse */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-[#2B2520]/75 font-bold uppercase tracking-[1px]">Active Role</p>
                  <p className="text-xs font-bold text-[#2B2520] capitalize truncate">
                    {currentRole === 'hod' ? 'HOD / Faculty' : currentRole === 'mentor' ? 'Industry Mentor' : currentRole === 'company' ? 'Recruiter' : 'Student Candidate'}
                  </p>
                </div>
              </div>
              {/* Lock icon in circle */}
              <div className="w-6 h-6 rounded-full bg-[#B39F84] flex items-center justify-center shrink-0 border border-[#2B2520]/20" title="Role is locked">
                <Lock className="w-3.5 h-3.5 text-[#2B2520]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#D6CCA8] border border-[#2B2520]/20 flex items-center justify-center text-[#2B2520]" title="Role is locked">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Connected Accounts */}
        <div className="px-2.5 pb-4">
          <ConnectedAccounts collapsed={collapsed} role={currentRole} />
        </div>

        {/* Navigation Menus */}
        <div className={`flex-1 overflow-y-auto ${collapsed ? 'px-1.5' : 'px-2.5'} py-2 space-y-4 sidebar-scrollbar`}>
          {/* STUDENT PORTAL MENU */}
          {currentRole === 'student' && (
            <>
              {/* Category 1: Skill Diagnostic & Readiness */}
              <div>
                {!collapsed && (
                  <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                    Skill Readiness
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    id="nav-dashboard"
                    onClick={() => handleTabClick('dashboard')}
                    title="Career Overview"
                    className={navBtnClass('dashboard')}
                  >
                    <Compass className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Career Overview</span>}
                  </button>

                  <button
                    id="nav-skills"
                    onClick={() => handleTabClick('skills')}
                    title="Skill Intelligence"
                    className={navBtnClass('skills')}
                  >
                    <Cpu className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Skill Intelligence</span>}
                  </button>

                  <button
                    id="nav-assessment"
                    onClick={() => handleTabClick('assessment')}
                    title="Skill Assessment"
                    className={navBtnClass('assessment')}
                  >
                    <Award className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Skill Assessment</span>}
                  </button>

                  <button
                    id="nav-skill-gap"
                    onClick={() => handleTabClick('skill-gap')}
                    title="Skill Gap Analysis"
                    className={navBtnClass('skill-gap')}
                  >
                    <Sparkles className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Skill Gap Analysis</span>}
                  </button>

                  <button
                    id="nav-learning"
                    onClick={() => handleTabClick('learning')}
                    title="Learning Hub"
                    className={navBtnClass('learning')}
                  >
                    <GraduationCap className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Learning Hub</span>}
                  </button>
                </div>
              </div>

              {/* Category 2: Placements & Work */}
              <div>
                {!collapsed && (
                  <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                    Jobs & Experience
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    id="nav-jobs"
                    onClick={() => handleTabClick('jobs')}
                    title="Jobs & Placements"
                    className={navBtnClass('jobs')}
                  >
                    <BriefcaseBusiness className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Jobs & Placements</span>}
                  </button>

                  <button
                    id="nav-tracker"
                    onClick={() => handleTabClick('tracker')}
                    title="Application Tracker"
                    className={navBtnClass('tracker')}
                  >
                    <FileText className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Application Tracker</span>}
                  </button>

                  <button
                    id="nav-gigs"
                    onClick={() => handleTabClick('gigs')}
                    title="Micro-Internship Gigs"
                    className={navBtnClass('gigs')}
                  >
                    <Briefcase className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Micro-Internships</span>}
                  </button>

                  <button
                    id="nav-projects"
                    onClick={() => handleTabClick('projects')}
                    title="Industry Projects"
                    className={navBtnClass('projects')}
                  >
                    <Layers className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Live Projects & Bounties</span>}
                  </button>

                  <button
                    id="nav-mentors"
                    onClick={() => handleTabClick('mentors')}
                    title="Mentor Capsules (15 Min)"
                    className={navBtnClass('mentors')}
                  >
                    <Users className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">Mentor Capsules</span>
                        <span className="ml-auto text-[9px] bg-[#5E3A5C]/40 text-[#B47A9A] font-bold px-1.5 py-0.5 rounded shrink-0 border border-[#5E3A5C]">
                          15 Min
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Category 3: Career Assets & Intelligence */}
              <div>
                {!collapsed && (
                  <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                    Credentials & AI
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    id="nav-resume"
                    onClick={() => handleTabClick('resume')}
                    title="Resume & Portfolio"
                    className={navBtnClass('resume')}
                  >
                    <FileText className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Resume & Portfolio</span>}
                  </button>

                  <button
                    id="nav-certs"
                    onClick={() => handleTabClick('certs')}
                    title="Certifications"
                    className={navBtnClass('certs')}
                  >
                    <Award className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Certifications & Badges</span>}
                  </button>

                  <button
                    id="nav-passport"
                    onClick={() => handleTabClick('passport')}
                    title="Experience Passport"
                    className={navBtnClass('passport')}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">Experience Passport</span>}
                  </button>

                  <button
                    id="nav-advisor"
                    onClick={() => handleTabClick('advisor')}
                    title="AI Career Advisor"
                    className={navBtnClass('advisor')}
                  >
                    <Sparkles className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">AI Career Advisor</span>}
                  </button>

                  <button
                    id="nav-helpdesk"
                    onClick={() => handleTabClick('helpdesk')}
                    title="AI Help Desk & Advisor"
                    className={navBtnClass('helpdesk')}
                  >
                    <HelpCircle className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">AI Help Desk (Bridge Buddy)</span>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* FACULTY / HOD PORTAL MENU */}
          {currentRole === 'hod' && (
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  ACADEMIC & INDUSTRY
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'faculty-overview', label: 'Faculty Overview', icon: Compass },
                  { id: 'faculty-profile', label: 'Faculty Profile', icon: UserIcon },
                  { id: 'industry-opportunities', label: 'Industry Opportunities', icon: Briefcase },
                  { id: 'faculty-internships', label: 'Faculty Internships', icon: GraduationCap },
                  { id: 'industrial-training', label: 'Industrial Training', icon: Building },
                  { id: 'fdp-programs', label: 'FDP Programs', icon: Award },
                  { id: 'consultancy', label: 'Consultancy', icon: BriefcaseBusiness },
                  { id: 'research-collaboration', label: 'Research Collaboration', icon: Users },
                  { id: 'live-projects', label: 'Live Industry Projects', icon: Layers },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={navBtnClass(item.id)}
                  >
                    <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>

              {!collapsed && (
                <div className="px-2.5 mt-4 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  ENGAGEMENT
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'student-mentorship', label: 'Student Mentorship', icon: UserCheck },
                  { id: 'workshops', label: 'Workshops & Guest Lectures', icon: Calendar },
                  { id: 'innovation-challenges', label: 'Innovation Challenges', icon: Sparkles },
                  { id: 'collaboration-hub', label: 'Collaboration Hub', icon: Building2 },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={navBtnClass(item.id)}
                  >
                    <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>

              {!collapsed && (
                <div className="px-2.5 mt-4 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  ACTIVITY
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'my-applications', label: 'My Applications', icon: FileText },
                  { id: 'my-collaborations', label: 'My Collaborations', icon: Users },
                  { id: 'achievements', label: 'Achievements & Certificates', icon: Award },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={navBtnClass(item.id)}
                  >
                    <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>

              {!collapsed && (
                <div className="px-2.5 mt-4 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  INTELLIGENCE
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'academic-intelligence', label: 'Academic Intelligence', icon: TrendingUp },
                  { id: 'ai-faculty-advisor', label: 'AI Faculty Advisor', icon: Sparkles },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={navBtnClass(item.id)}
                  >
                    <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INDUSTRY MENTOR PORTAL MENU */}
          {currentRole === 'mentor' && (
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  Mentorship
                </div>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => handleTabClick('mentor-pipeline')}
                  title="Assigned Student Pipeline"
                  className={navBtnClass('mentor-pipeline')}
                >
                  <UserCheck className="w-4 h-4 text-[#B47A9A] shrink-0" />
                  {!collapsed && <span className="truncate">Student Pipeline</span>}
                </button>

                <button
                  onClick={() => handleTabClick('mentor-reviews')}
                  title="Ghost Task Submissions"
                  className={navBtnClass('mentor-reviews')}
                >
                  <Terminal className="w-4 h-4 text-[#B47A9A] shrink-0" />
                  {!collapsed && <span className="truncate">Task Submissions</span>}
                </button>

                <button
                  onClick={() => handleTabClick('mentor-capsules')}
                  title="15-Min Capsule Slots"
                  className={navBtnClass('mentor-capsules')}
                >
                  <Users className="w-4 h-4 text-[#B47A9A] shrink-0" />
                  {!collapsed && <span className="truncate">15-Min Capsule Slots</span>}
                </button>
              </div>
            </div>
          )}

          {/* RECRUITER PORTAL MENU */}
          {(currentRole === 'company' || currentRole === 'recruiter') && (
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  TALENT & HIRING
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Compass },
                  { id: 'discover-talent', label: 'Discover Talent', icon: Users },
                  { id: 'applications', label: 'Applications', icon: FileText },
                  { id: 'shortlisted', label: 'Shortlisted', icon: UserCheck },
                  { id: 'job-postings', label: 'Job Postings', icon: Briefcase },
                  { id: 'post-job', label: 'Post a Job', icon: BriefcaseBusiness },
                  { id: 'interviews', label: 'Interviews', icon: Calendar },
                  { id: 'campus-drives', label: 'Campus Drives', icon: Building2 },
                  { id: 'internship-programs', label: 'Internship Programs', icon: GraduationCap },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={navBtnClass(item.id)}
                  >
                    <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>

              {!collapsed && (
                <div className="px-2.5 mt-4 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  COLLABORATION
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'university-collaboration', label: 'University Collaboration', icon: Users },
                  { id: 'live-projects', label: 'Live Projects', icon: Layers },
                  { id: 'research-opportunities', label: 'Research Opportunities', icon: Sparkles },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        title={item.label}
                        className={navBtnClass(item.id)}
                    >
                        <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                ))}
              </div>

              {!collapsed && (
                <div className="px-2.5 mt-4 mb-1.5 text-[10px] font-bold text-[#F3E9EC]/40 uppercase tracking-[1.5px]">
                  ACCOUNT
                </div>
              )}
              <div className="space-y-0.5">
                {[
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                    { id: 'company-profile', label: 'Company Profile', icon: Building },
                    { id: 'messages', label: 'Messages', icon: Users },
                    { id: 'notifications', label: 'Notifications', icon: FileText },
                    { id: 'settings', label: 'Settings', icon: HelpCircle },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        title={item.label}
                        className={navBtnClass(item.id)}
                    >
                        <item.icon className="w-4 h-4 text-[#B47A9A] shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* User Profile Card & Sign Out */}
        <div className="p-3.5 border-t border-[#EEEBDA]/20 bg-[#282B4A]">
          {!collapsed ? (
            <div className="space-y-3">
              <div
                onClick={() => {
                  onOpenProfile();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#D6CCA8] border border-[#2B2520]/20 hover:border-[#2B2520] cursor-pointer transition-all group shadow-sm"
              >
                <div className="relative shrink-0">
                  {localStorage.getItem('profilePhoto') ? (
                    <img
                      src={localStorage.getItem('profilePhoto')!}
                      alt="Avatar"
                      className="w-9 h-9 rounded-lg object-cover border border-[#2B2520]/20 shadow"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#B39F84] border border-[#2B2520]/20 flex items-center justify-center font-bold text-[#2B2520] text-xs shadow">
                      {getInitials(
                        currentRole === 'hod'
                          ? 'Dr. Arvind Sharma'
                          : currentRole === 'mentor'
                          ? 'Amit Verma'
                          : currentRole === 'company'
                          ? (localStorage.getItem('userName') || 'Corporate Recruiter')
                          : student?.name || localStorage.getItem('userName') || 'Adarsh Pratap'
                      )}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-600 border-2 border-[#D6CCA8] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#2B2520] truncate group-hover:text-black transition-colors">
                    {currentRole === 'hod'
                      ? 'Dr. Arvind Sharma'
                      : currentRole === 'mentor'
                      ? 'Amit Verma'
                      : currentRole === 'company'
                      ? (localStorage.getItem('userName') || 'Corporate Recruiter')
                      : student?.name || localStorage.getItem('userName') || 'Adarsh Pratap'}
                  </p>
                  <p className="text-xs text-[#2B2520]/80 truncate font-sans">
                    {currentRole === 'hod'
                      ? 'HOD • Dept of CSIT'
                      : currentRole === 'mentor'
                      ? 'TCS Senior Architect'
                      : currentRole === 'company'
                      ? 'Talent Acquisition Partner'
                      : student?.batch ? `CSIT - Batch ${student.batch}` : 'CSIT - Batch 2025-29'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-1.5 text-xs">
                <button
                  onClick={() => {
                    onOpenProfile();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="text-[#2B2520]/80 hover:text-black flex items-center gap-1.5 transition-colors font-medium"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#2B2520]" />
                  <span>Profile</span>
                </button>
                <span className="text-[#2B2520]/30">|</span>
                <button
                  onClick={() => {
                    onLogout();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="text-rose-700 hover:text-rose-950 flex items-center gap-1 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <button
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-lg bg-[#D6CCA8] border border-[#2B2520]/20 flex items-center justify-center font-bold text-[#2B2520] text-xs shadow-md"
                title="View Profile"
              >
                {getInitials(
                  currentRole === 'hod'
                    ? 'Dr. Arvind'
                    : currentRole === 'mentor'
                    ? 'Amit'
                    : currentRole === 'company' || currentRole === 'recruiter'
                    ? (localStorage.getItem('userName') || 'Recruiter')
                    : student?.name || localStorage.getItem('userName') || 'Adarsh'
                )}
              </button>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1 rounded-lg text-[#2B2520]/70 hover:text-black hover:bg-[#C2B095] transition-colors"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop / Large Screen In-Flow Sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 h-screen transition-all duration-200 ${isCollapsed ? 'w-[70px]' : 'w-64'}`}>
        {renderContent(isCollapsed, false)}
      </aside>

      {/* 2. Mobile / Narrow Screen Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Solid dark backdrop with smooth dismissal */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 flex flex-col h-full bg-[#B39F84]">
            {renderContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
};
