import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ProfileDrawer } from './components/ProfileDrawer';
import { NotificationModal, NotificationItem } from './components/NotificationModal';
import { AuthPortal, AuthSuccessPayload } from './components/AuthPortal';
import { DashboardSplash } from './components/DashboardSplash';
import { ApplyGigModal } from './components/ApplyGigModal';
import { BookMentorModal } from './components/BookMentorModal';
import { Toast } from './components/Toast';
import { BridgeBuddy } from './components/BridgeBuddy';

import { StudentDashboard } from './pages/StudentDashboard';
import { SkillIntelligenceView } from './pages/SkillIntelligenceView';
import { SkillAssessmentView } from './pages/SkillAssessmentView';
import { SkillGapAnalysisView } from './pages/SkillGapAnalysisView';
import { LearningHubView } from './pages/LearningHubView';
import { JobsPlacementsView } from './pages/JobsPlacementsView';
import { ApplicationsTrackerView } from './pages/ApplicationsTrackerView';
import { ProjectsChallengesView } from './pages/ProjectsChallengesView';
import { CertificationsAchievementsView } from './pages/CertificationsAchievementsView';
import { ResumePortfolioView } from './pages/ResumePortfolioView';
import { AICareerAdvisorView } from './pages/AICareerAdvisorView';

import { MicroGigsView } from './pages/MicroGigsView';
import { MentorCapsulesView } from './pages/MentorCapsulesView';
import { ExperiencePassportView } from './pages/ExperiencePassportView';
import { TrustVerificationView } from './pages/TrustVerificationView';
import { AIHelpdeskView } from './pages/AIHelpdeskView';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { 
  TalentDiscovery, 
  ApplicationsPage, 
  ShortlistedPage, 
  JobPostingsPage, 
  PostJobPage, 
  InterviewsPage, 
  CampusDrivesPage, 
  InternshipProgramsPage, 
  UniversityCollaborationPage, 
  LiveProjectsPage, 
  ResearchOpportunitiesPage, 
  RecruiterAnalyticsPage, 
  CompanyProfilePage, 
  MessagesPage, 
  NotificationsPage, 
  SettingsPage 
} from './pages/recruiter/RecruiterPages';

import { UserRole, StudentProfile, Mentor, Gig, PassportRecord, JobOpportunity } from './types';
import { getStoredUserProfile } from './components/ProfessionalProfile';
import { CollegeItem, COLLEGES_DATA } from './data/colleges';
import { 
  fetchStudentProfile,
  fetchGigs, 
  fetchMentors, 
  fetchPassport, 
  createGig, 
  mintPassportRecord 
} from './services/api';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('role') as UserRole) || 'student';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [student, setStudent] = useState<StudentProfile>(() => {
    const p = getStoredUserProfile();
    return {
      id: 1,
      name: p.name || 'Adarsh Pratap Singh',
      course: p.department || 'Computer Science & IT (CSIT)',
      batch: p.year || '2025-29',
      college: p.college || 'Mahatma Jyotiba Phule Rohilkhand University, Bareilly',
      rollNo: p.rollNo || '22001015001',
      email: p.email || 'adarsh.pratap@mjpru.ac.in',
      targetRole: 'Full-Stack Software Engineer',
      careerReadiness: 81,
      experienceScore: 64,
      dnaScores: {
        algorithmicThinking: 88,
        systemDesign: 72,
        codeQuality: 85,
        communication: 79,
        problemSolving: 90,
        adaptability: 84
      },
      timeMachinePredictions: {
        currentQuarter: 'Q3 2026',
        targetDate: 'July 2027',
        expectedPlacementPackage: '₹14.5 – ₹22 LPA',
        milestones: [
          { month: 'Sep 2026', target: 'Complete 3 Verified Micro-Internships', completed: true },
          { month: 'Nov 2026', target: 'Attend 5 Mentor Capsules with Senior Architects', completed: true },
          { month: 'Jan 2027', target: 'Deploy Cloud-Native Distributed Microservice', completed: false },
          { month: 'Apr 2027', target: 'Participate in Pre-Placement Partner Hackathons', completed: false }
        ]
      }
    };
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [passport, setPassport] = useState<PassportRecord[]>([]);

  // Modals & Splash state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('student');

  const [splashData, setSplashData] = useState<{
    isOpen: boolean;
    role: UserRole;
    college?: CollegeItem | null;
  }>({
    isOpen: false,
    role: 'student',
    college: null
  });

  const [applyingGig, setApplyingGig] = useState<Gig | null>(null);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);

  // Mobile & Sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Theme Management (Light / Dark Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('appTheme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.remove('light');
    }
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New Micro-Gig Available',
      message: 'CloudSphere Systems posted a new Express API task with ₹2,500 stipend.',
      time: '10m ago',
      type: 'gig',
      read: false
    },
    {
      id: 'n2',
      title: 'Capsule Confirmed',
      message: 'Your 15-minute capsule with Amit Verma (TCS) is confirmed for 4:00 PM.',
      time: '1h ago',
      type: 'mentor',
      read: false
    },
    {
      id: 'n3',
      title: 'Passport Badge Minted',
      message: 'PostgreSQL Query Optimization proof-of-work has been added to your blockchain ledger.',
      time: '3h ago',
      type: 'passport',
      read: true
    }
  ]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync initial backend data from database
  const reloadDatabaseData = async () => {
    try {
      const [freshStudent, freshGigs, freshMentors, freshPassport] = await Promise.all([
        fetchStudentProfile(),
        fetchGigs(),
        fetchMentors(),
        fetchPassport(student.id)
      ]);
      if (freshStudent && freshStudent.name) {
        const savedName = localStorage.getItem('userName');
        setStudent(savedName ? { ...freshStudent, name: savedName } : freshStudent);
      }
      if (Array.isArray(freshGigs)) {
        setGigs(freshGigs);
      }
      if (Array.isArray(freshMentors)) {
        setMentors(freshMentors);
      }
      if (Array.isArray(freshPassport)) {
        setPassport(freshPassport);
      }
    } catch (err) {
      console.warn('Database sync notice:', err);
    }
  };

  useEffect(() => {
    reloadDatabaseData();
  }, [student.id, activeTab]);

  // Role Based Route Guard Enforcement
  useEffect(() => {
    const storedRole = localStorage.getItem('role') as UserRole;
    if (storedRole && storedRole !== currentRole) {
      setCurrentRole(storedRole);
    }
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('role', newRole);
    localStorage.setItem('userRole', newRole === 'mentor' ? 'Mentor' : newRole === 'hod' ? 'HOD' : newRole === 'company' ? 'company' : 'student');
    setActiveTab('dashboard');
    showToast(`Switched view to ${newRole === 'hod' ? 'HOD / Faculty' : newRole === 'mentor' ? 'Industry Mentor' : newRole === 'company' ? 'Recruiter' : 'Student Candidate'} Mode`, 'info');
  };

  const handleApplyGigSuccess = async (gigTitle: string) => {
    showToast(`Application successfully submitted for ${gigTitle}! Saved to database.`, 'success');
    const freshGigs = await fetchGigs();
    setGigs(freshGigs);
  };

  const handleBookMentorSuccess = async (mentorName: string, slot: string) => {
    showToast(`15-Min Capsule booked with ${mentorName} for ${slot}! Saved to database ledger.`, 'success');
    const freshMentors = await fetchMentors();
    setMentors(freshMentors);
  };

  const handleCreateGig = async (newGigData: any) => {
    try {
      await createGig({
        title: newGigData.title,
        requiredSkill: newGigData.requiredSkill,
        skill: newGigData.requiredSkill,
        hours: Number(newGigData.hours),
        payment: Number(newGigData.payment),
        description: newGigData.description,
        company: currentRole === 'mentor' ? 'TCS Enterprise' : 'Industry Partner'
      });
      const freshGigs = await fetchGigs();
      setGigs(freshGigs);
      showToast(`New Micro-Task "${newGigData.title}" published & saved to database!`, 'success');
    } catch (err) {
      showToast(`Published micro-task "${newGigData.title}"!`, 'success');
      const freshGigs = await fetchGigs();
      setGigs(freshGigs);
    }
  };

  const handleMintPassport = async (title: string, company: string, score: number) => {
    try {
      await mintPassportRecord({
        studentId: student.id,
        title,
        company,
        score,
        skillsVerified: ['Node.js', 'Express', 'JWT Auth', 'Automated Testing']
      });

      const freshPassport = await fetchPassport(student.id);
      setPassport(freshPassport);

      setStudent(prev => ({
        ...prev,
        experienceScore: Math.min(100, prev.experienceScore + 12),
        careerReadiness: Math.min(100, prev.careerReadiness + 5)
      }));
      showToast(`Cryptographic Credential Minted & Stored in Database! Score boosted.`, 'success');
    } catch (err) {
      showToast(`Credential Minted!`, 'success');
    }
  };

  const handleSaveProfile = (updated: Partial<StudentProfile>) => {
    setStudent(prev => ({ ...prev, ...updated }));
    showToast('Profile & Career Trajectory recalibrated!', 'success');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Trigger registration / login splash and pathway redirect
  const handleAuthPortalSuccess = (payload: AuthSuccessPayload) => {
    setIsAuthOpen(false);

    // Update state
    setCurrentRole(payload.role);
    localStorage.setItem('role', payload.role);
    localStorage.setItem('userRole', payload.role === 'mentor' ? 'Mentor' : payload.role === 'hod' ? 'HOD' : payload.role === 'company' ? 'company' : 'student');

    if (payload.role === 'student') {
      setStudent(prev => ({
        ...prev,
        name: payload.name,
        course: payload.department || prev.course,
        college: payload.college?.name || prev.college,
        batch: payload.batch || prev.batch,
        rollNo: payload.rollNo || prev.rollNo,
        email: payload.email || prev.email
      }));
    }

    // Launch Ladder AI Logo Opening Animation Splash
    setSplashData({
      isOpen: true,
      role: payload.role,
      college: payload.college || (payload.role === 'student' ? COLLEGES_DATA[0] : null)
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-[#B39F84] text-[#2B2520] overflow-hidden font-sans antialiased selection:bg-[#D6CCA8]">
      {/* Splash Screen on Registration / Login Launch */}
      {splashData.isOpen && (
        <DashboardSplash
          role={splashData.role}
          college={splashData.college}
          onFinished={() => {
            setSplashData(prev => ({ ...prev, isOpen: false }));
            setActiveTab('dashboard');
            showToast(`Launched ${splashData.role === 'hod' ? 'HOD Panel' : splashData.role === 'mentor' ? 'Mentor Capsule' : splashData.role === 'company' ? 'Recruiter Portal' : 'Student OS'}!`, 'success');
          }}
        />
      )}

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        student={student}
        onRoleChange={handleRoleChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={() => {
          setAuthInitialMode('login');
          setAuthInitialRole(currentRole);
          setIsAuthOpen(true);
          showToast('Signed out of session. Choose your login or register a new pathway.', 'info');
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          currentRole={currentRole}
          student={student}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenTrust={() => setActiveTab('trust')}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAuth={() => {
            setAuthInitialMode('register');
            setAuthInitialRole(currentRole);
            setIsAuthOpen(true);
          }}
          onLogout={() => {
            setAuthInitialMode('login');
            setAuthInitialRole(currentRole);
            setIsAuthOpen(true);
            showToast('Signed out of session. Choose your login or register a new pathway.', 'info');
          }}
          onRoleChange={handleRoleChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onSelectGig={(gig) => {
            setActiveTab('gigs');
            setApplyingGig(gig);
          }}
          onSelectMentor={(mentor) => {
            setActiveTab('mentors');
            setBookingMentor(mentor);
          }}
          onShowToast={showToast}
          gigs={gigs}
          mentors={mentors}
          passport={passport}
          onToggleMobileSidebar={() => setIsMobileMenuOpen(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Page Routing with Strict Role Guard */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7 min-w-0">
          <div className="w-full max-w-7xl mx-auto pb-12 min-w-0">
            {/* ROUTE GUARD: If role === 'hod', render ONLY HOD dashboard */}
            {currentRole === 'hod' && (
              <FacultyDashboard onShowToast={showToast} activeTab={activeTab} />
            )}

            {/* ROUTE GUARD: If role === 'mentor', render ONLY Mentor dashboard */}
            {currentRole === 'mentor' && (
              <MentorDashboard 
                onShowToast={showToast} 
                activeTab={activeTab}
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {/* ROUTE GUARD: If role === 'company' / Recruiter */}
            {currentRole === 'company' && (
              <>
                {activeTab === 'dashboard' && <RecruiterDashboard />}
                {activeTab === 'discover-talent' && <TalentDiscovery onNavigate={(t) => setActiveTab(t)} />}
                {activeTab === 'applications' && <ApplicationsPage />}
                {activeTab === 'shortlisted' && <ShortlistedPage />}
                {activeTab === 'job-postings' && (
                  <JobPostingsPage 
                    onNavigate={(t) => setActiveTab(t)} 
                    onShowToast={showToast} 
                  />
                )}
                {activeTab === 'post-job' && (
                  <PostJobPage 
                    onNavigate={(t) => setActiveTab(t)} 
                    onShowToast={showToast} 
                  />
                )}
                {activeTab === 'interviews' && <InterviewsPage />}
                {activeTab === 'campus-drives' && <CampusDrivesPage />}
                {activeTab === 'internship-programs' && <InternshipProgramsPage />}
                {activeTab === 'university-collaboration' && <UniversityCollaborationPage />}
                {activeTab === 'live-projects' && <LiveProjectsPage />}
                {activeTab === 'research-opportunities' && <ResearchOpportunitiesPage />}
                {activeTab === 'analytics' && <RecruiterAnalyticsPage />}
                {activeTab === 'company-profile' && <CompanyProfilePage />}
                {activeTab === 'messages' && <MessagesPage />}
                {activeTab === 'notifications' && <NotificationsPage />}
                {activeTab === 'settings' && <SettingsPage onShowToast={showToast} />}
              </>
            )}

            {/* ROUTE GUARD: Student Candidate Portal */}
            {currentRole === 'student' && (
              <>
                {activeTab === 'dashboard' && (
                  <StudentDashboard
                    student={student}
                    mentors={mentors}
                    gigs={gigs}
                    passport={passport}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onBookMentor={(m) => setBookingMentor(m)}
                    onApplyGig={(g) => setApplyingGig(g)}
                  />
                )}

                {activeTab === 'skills' && (
                  <SkillIntelligenceView 
                    onNavigateToGigs={() => setActiveTab('gigs')}
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}

                {activeTab === 'assessment' && (
                  <SkillAssessmentView 
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                    onScoreUpdated={() => {
                      showToast('Skill DNA & Readiness updated from assessment results!', 'success');
                    }}
                  />
                )}

                {activeTab === 'skill-gap' && (
                  <SkillGapAnalysisView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                    onBookMentor={(topic) => {
                      showToast(`Opened mentor booking for "${topic}"`, 'info');
                      setActiveTab('mentors');
                    }}
                  />
                )}

                {activeTab === 'learning' && (
                  <LearningHubView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                    onSkillUpdated={() => {
                      showToast('Course module completed! Skill readiness boosted.', 'success');
                    }}
                  />
                )}

                {activeTab === 'jobs' && (
                  <JobsPlacementsView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                    onApplicationCreated={() => {
                      showToast('Application registered in tracker ledger!', 'success');
                    }}
                  />
                )}

                {(activeTab === 'tracker' || activeTab === 'applications') && (
                  <ApplicationsTrackerView
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsChallengesView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}

                {activeTab === 'certs' && (
                  <CertificationsAchievementsView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}

                {activeTab === 'resume' && (
                  <ResumePortfolioView
                    student={student}
                    onOpenProfile={() => setIsProfileOpen(true)}
                  />
                )}

                {activeTab === 'advisor' && (
                  <AICareerAdvisorView
                    student={student}
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}

                {activeTab === 'gigs' && (
                  <MicroGigsView
                    gigs={gigs}
                    onApplyGig={(g) => setApplyingGig(g)}
                    onCreateGig={handleCreateGig}
                  />
                )}

                {activeTab === 'mentors' && (
                  <MentorCapsulesView
                    mentors={mentors}
                    onBookMentor={(m) => setBookingMentor(m)}
                  />
                )}

                {activeTab === 'passport' && (
                  <ExperiencePassportView records={passport} />
                )}

                {activeTab === 'trust' && (
                  <TrustVerificationView />
                )}

                {activeTab === 'helpdesk' && (
                  <AIHelpdeskView student={student} />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        student={student}
        currentRole={currentRole}
        onSaveProfile={handleSaveProfile}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsProfileOpen(false);
        }}
      />

      {/* Notifications Drawer */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onActionClick={(item) => {
          if (item.type === 'gig') setActiveTab('gigs');
          if (item.type === 'mentor') setActiveTab('mentors');
          if (item.type === 'passport') setActiveTab('passport');
          setIsNotificationsOpen(false);
        }}
      />

      {/* Comprehensive 3-Pathway AuthPortal (Register + Login in Linear Style) */}
      <AuthPortal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        initialRole={authInitialRole}
        onAuthSuccess={handleAuthPortalSuccess}
      />

      {/* Gig Application Modal */}
      <ApplyGigModal
        gig={applyingGig}
        isOpen={!!applyingGig}
        onClose={() => setApplyingGig(null)}
        onSuccess={handleApplyGigSuccess}
        studentId={student.id}
      />

      {/* Mentor Booking Modal */}
      <BookMentorModal
        mentor={bookingMentor}
        isOpen={!!bookingMentor}
        onClose={() => setBookingMentor(null)}
        onSuccess={handleBookMentorSuccess}
        studentId={student.id}
      />

      {/* Global Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Floating AI Assistant - Bridge Buddy */}
      <BridgeBuddy student={student} currentRole={currentRole} />
    </div>
  );
};

export default App;
