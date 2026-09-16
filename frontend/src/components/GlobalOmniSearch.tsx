import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Briefcase,
  Users,
  Award,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  FileText,
  Video,
  FileCheck,
  Lightbulb,
  Handshake,
  Star,
  Target,
  ArrowRight,
  Layers,
  Zap,
  TrendingUp,
  Flame,
  Code,
  CornerDownLeft
} from 'lucide-react';
import { UserRole, StudentProfile, Mentor, Gig, PassportRecord } from '../types';
import { mockCandidates, mockJobs, mockApplications, mockInterviews, mockDrives, mockCollabs, mockInternships } from '../data/recruiterMockData';
import {
  getStoredResearchCollaborations,
  getStoredLiveProjects,
  getStoredMentorshipProfiles,
  getStoredWorkshops,
  getStoredFacultyApplications,
  getStoredFacultyCollaborations,
  getStoredFacultyAchievements
} from '../data/facultyCollaborationData';
import { getStoredFdpPrograms, getStoredConsultancies } from '../data/fdpConsultancyData';
import { INITIAL_SKILLS } from '../data/portalData';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  tagColor?: string;
  badge?: string;
  targetTab: string;
  actionLabel?: string;
  onSelect?: () => void;
  metadata?: Record<string, any>;
}

interface GlobalOmniSearchProps {
  currentRole: UserRole;
  student: StudentProfile | null;
  gigs?: Gig[];
  mentors?: Mentor[];
  passport?: PassportRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateTab: (tab: string) => void;
  onSelectGig?: (gig: Gig) => void;
  onSelectMentor?: (mentor: Mentor) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const GlobalOmniSearch: React.FC<GlobalOmniSearchProps> = ({
  currentRole,
  student,
  gigs = [],
  mentors = [],
  passport = [],
  searchQuery,
  setSearchQuery,
  onNavigateTab,
  onSelectGig,
  onSelectMentor,
  onShowToast = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic Placeholder based on Role
  const placeholderText = useMemo(() => {
    switch (currentRole) {
      case 'student':
        return 'Search gigs, mentors, skills, quests, credentials, pages...';
      case 'company':
        return 'Search candidates, job postings, campus drives, interviews...';
      case 'hod':
        return 'Search research, grants, live projects, FDPs, MOUs, faculty...';
      case 'mentor':
        return 'Search booked capsules, mentees, reviews, published tasks...';
      default:
        return 'Search anything across platform...';
    }
  }, [currentRole]);

  // Role Badge info
  const roleInfo = useMemo(() => {
    switch (currentRole) {
      case 'student':
        return { name: 'Student Portal', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' };
      case 'company':
        return { name: 'Recruiter Portal', icon: Building, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' };
      case 'hod':
        return { name: 'HOD / Faculty Portal', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' };
      case 'mentor':
        return { name: 'Industry Mentor Portal', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
    }
  }, [currentRole]);

  // Quick / Popular Suggestions when search query is empty
  const popularSuggestions = useMemo(() => {
    switch (currentRole) {
      case 'student':
        return [
          { text: 'React.js', category: 'Skills', tab: 'skills' },
          { text: 'Node.js Express Task', category: 'Gigs', tab: 'gigs' },
          { text: 'Amit Verma (TCS)', category: 'Mentors', tab: 'mentors' },
          { text: 'PostgreSQL Optimization', category: 'Passport', tab: 'passport' },
          { text: 'Digital Twin Simulator', category: 'Pages', tab: 'twin' },
          { text: 'Skill Quests', category: 'Quests', tab: 'quests' }
        ];
      case 'company':
        return [
          { text: 'Full-Stack Candidates', category: 'Talent', tab: 'discover-talent' },
          { text: 'Software Engineer Intern', category: 'Jobs', tab: 'job-postings' },
          { text: 'Campus Drive 2026', category: 'Drives', tab: 'campus-drives' },
          { text: 'Shortlisted Applicants', category: 'Pipeline', tab: 'shortlisted' },
          { text: 'Technical Interviews', category: 'Interviews', tab: 'interviews' },
          { text: 'Recruitment Analytics', category: 'Tools', tab: 'analytics' }
        ];
      case 'hod':
        return [
          { text: 'AIIMS Medical AI Grant', category: 'Research', tab: 'collaboration-hub' },
          { text: 'Post-Quantum Cryptography', category: 'Research', tab: 'collaboration-hub' },
          { text: 'TCS Telemetry Project', category: 'Projects', tab: 'live-projects' },
          { text: 'AICTE ATAL FDP', category: 'FDPs', tab: 'fdp-programs' },
          { text: 'My Applications', category: 'Activity', tab: 'my-applications' },
          { text: 'Academic Intelligence', category: 'Intelligence', tab: 'academic-intelligence' }
        ];
      case 'mentor':
        return [
          { text: '15-Min Capsule Bookings', category: 'Capsules', tab: 'mentor-capsules' },
          { text: 'Adarsh Pratap Singh (JWT Review)', category: 'Sessions', tab: 'mentor-capsules' },
          { text: 'Student Mentee Pipeline', category: 'Mentees', tab: 'mentor-pipeline' },
          { text: 'PR Code Reviews', category: 'Reviews', tab: 'mentor-reviews' },
          { text: 'Publish Micro-Task', category: 'Gigs', tab: 'postgig' }
        ];
    }
  }, [currentRole]);

  // Index and search items based on current portal
  const allPortalItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // ==========================================
    // 1. STUDENT PORTAL DATA
    // ==========================================
    if (currentRole === 'student') {
      // Pages / Sections
      items.push(
        { id: 'p-dash', title: 'Student Dashboard', subtitle: 'Overview, career readiness score & DNA radar', category: 'Pages', icon: Layers, targetTab: 'dashboard', actionLabel: 'Open Dashboard' },
        { id: 'p-skills', title: 'Skill Intelligence Engine', subtitle: 'Skill diagnostic, benchmark scores & market demand', category: 'Pages', icon: Zap, targetTab: 'skills', actionLabel: 'View Skills' },
        { id: 'p-gigs', title: 'Micro-Gigs & Internships Hub', subtitle: 'Paid student tasks, company deliverables & stipends', category: 'Pages', icon: Briefcase, targetTab: 'gigs', actionLabel: 'Explore Gigs' },
        { id: 'p-mentors', title: 'Industry Mentors & Capsules', subtitle: '1-on-1 15-min mentor sessions with FAANG/Tier-1 leaders', category: 'Pages', icon: Users, targetTab: 'mentors', actionLabel: 'Book Mentor' },
        { id: 'p-passport', title: 'Cryptographic Skill Passport', subtitle: 'Verified proof-of-work, hashes & blockchain credentials', category: 'Pages', icon: ShieldCheck, targetTab: 'passport', actionLabel: 'View Passport' },
        { id: 'p-twin', title: 'AI Digital Twin & Career Simulator', subtitle: 'Career readiness simulations and trajectory planner', category: 'Pages', icon: Sparkles, targetTab: 'twin', actionLabel: 'Simulate Career' },
        { id: 'p-quests', title: 'Skill Quests & Challenges', subtitle: 'Hands-on coding challenges & portfolio quests', category: 'Pages', icon: Target, targetTab: 'quests', actionLabel: 'Start Quests' },
        { id: 'p-learning', title: 'Learning Hub & Curated Tracks', subtitle: 'Self-paced video modules & project roadmaps', category: 'Pages', icon: BookOpen, targetTab: 'learning-hub', actionLabel: 'Open Hub' },
        { id: 'p-interview', title: 'AI Mock Interview Prep', subtitle: 'Real-time technical interview simulator & behavioral feedback', category: 'Pages', icon: Video, targetTab: 'interview-prep', actionLabel: 'Practice Interview' },
        { id: 'p-time-machine', title: 'Career Time Machine', subtitle: 'Predictive timeline for 2026–2027 placement milestones', category: 'Pages', icon: Clock, targetTab: 'time-machine', actionLabel: 'View Predictions' },
        { id: 'p-trust', title: 'Trust & Verification Ledger', subtitle: 'Institutional verification and accreditation status', category: 'Pages', icon: ShieldCheck, targetTab: 'trust', actionLabel: 'Check Trust' }
      );

      // Micro-Gigs
      const gigsList = gigs.length > 0 ? gigs : [
        { id: 101, title: 'Express API JWT Auth & Rate Limiting', company: 'CloudSphere Systems', skill: 'Node.js & Express', hours: 4, payment: 2500, status: 'open' as const, description: 'Implement production-ready JWT authentication middleware with redis rate limiting.' },
        { id: 102, title: 'PostgreSQL Query Optimization & Indexing', company: 'DataMatrix Labs', skill: 'PostgreSQL & SQL', hours: 6, payment: 3500, status: 'open' as const, description: 'Analyze slow query logs, build B-Tree compound indexes and optimize joins.' },
        { id: 103, title: 'React 18 Dashboard UI & Recharts', company: 'PixelWorks Studio', skill: 'React.js & TypeScript', hours: 5, payment: 3000, status: 'open' as const, description: 'Build a responsive real-time analytics dashboard with Tailwind and Recharts.' },
        { id: 104, title: 'FastAPI Microservice for PDF Extraction', company: 'DocuMind AI', skill: 'Python & FastAPI', hours: 8, payment: 4500, status: 'open' as const, description: 'Develop an asynchronous document ingestion pipeline using FastAPI and PyMuPDF.' }
      ];

      gigsList.forEach(g => {
        items.push({
          id: `gig-${g.id}`,
          title: g.title,
          subtitle: `${g.company} • ${g.skill} • ${g.hours} hrs • ₹${g.payment.toLocaleString()}`,
          category: 'Gigs',
          icon: Briefcase,
          tag: `₹${g.payment.toLocaleString()}`,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badge: g.skill,
          targetTab: 'gigs',
          actionLabel: 'Apply Micro-Gig',
          onSelect: () => {
            if (onSelectGig) onSelectGig(g);
          },
          metadata: g
        });
      });

      // Mentors
      const mentorsList = mentors.length > 0 ? mentors : [
        { id: 1, name: 'Amit Verma', role: 'Staff Backend Architect', company: 'Tata Consultancy Services', experience: 9, match: 96, availability: true, specialization: 'Distributed Systems & Cloud Ops', bio: 'Helps students master backend architectures, Docker containerization, and AWS microservices.' },
        { id: 2, name: 'Priya Sharma', role: 'Lead Data Scientist', company: 'Fractal Analytics', experience: 7, match: 91, availability: true, specialization: 'Machine Learning & Python', bio: 'Specializes in computer vision pipelines, scikit-learn model tuning, and data storytelling.' },
        { id: 3, name: 'Rohan Joshi', role: 'Senior Frontend Engineer', company: 'Swiggy', experience: 6, match: 88, availability: true, specialization: 'React 18 & Web Performance', bio: 'Mentors on frontend state management, WebSockets, and modern UI engineering.' },
        { id: 4, name: 'Dr. Meera Iyer', role: 'Principal Security Researcher', company: 'Cisco Systems', experience: 12, match: 94, availability: true, specialization: 'Cybersecurity & Zero Trust', bio: 'Guiding undergraduates on threat modeling, cryptosystems, and defensive network architectures.' }
      ];

      mentorsList.forEach(m => {
        items.push({
          id: `mentor-${m.id}`,
          title: `${m.name} (${m.company})`,
          subtitle: `${m.role} • ${m.specialization || 'Technical Mentor'} • ${m.experience} yrs exp`,
          category: 'Mentors',
          icon: Users,
          tag: `${m.match}% Match`,
          tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          badge: m.company,
          targetTab: 'mentors',
          actionLabel: 'Book 15-Min Capsule',
          onSelect: () => {
            if (onSelectMentor) onSelectMentor(m);
          },
          metadata: m
        });
      });

      // Skills & DNA Inventory
      INITIAL_SKILLS.forEach(s => {
        items.push({
          id: `skill-${s.id}`,
          title: `${s.name} (${s.subCategory || 'Technical'})`,
          subtitle: `Proficiency Level ${s.level}/${s.maxLevel} • Score: ${s.score}/100 • Verified: ${s.verified ? 'Yes' : 'Pending'}`,
          category: 'Skills',
          icon: Zap,
          tag: `Score ${s.score}`,
          tagColor: s.score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          targetTab: 'skills',
          actionLabel: 'View Skill Benchmark'
        });
      });

      // Passport Credentials
      const passportList = passport.length > 0 ? passport : [
        { id: 1, title: 'PostgreSQL Query Optimization & Indexing', company: 'DataMatrix Labs', experience_type: 'Micro-Internship', verified: true, score: 94, hash: '0x7F9A...B32C' },
        { id: 2, title: 'Express JWT Security & Middleware Architecture', company: 'CloudSphere Systems', experience_type: 'Micro-Internship', verified: true, score: 91, hash: '0x4E1B...9D8F' }
      ];

      passportList.forEach(p => {
        items.push({
          id: `pass-${p.id}`,
          title: p.title,
          subtitle: `${p.company} • ${p.experience_type} • Score ${p.score} • Cryptographically Minted`,
          category: 'Passport',
          icon: ShieldCheck,
          tag: 'Verified Badge',
          tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          targetTab: 'passport',
          actionLabel: 'Inspect Credential'
        });
      });
    }

    // ==========================================
    // 2. RECRUITER / COMPANY PORTAL DATA
    // ==========================================
    else if (currentRole === 'company') {
      // Navigation Pages
      items.push(
        { id: 'r-dash', title: 'Recruiter Dashboard', subtitle: 'Key recruitment pipeline metrics, active openings & candidate matches', category: 'Pages', icon: Layers, targetTab: 'dashboard', actionLabel: 'Open Dashboard' },
        { id: 'r-talent', title: 'Talent Discovery Pool', subtitle: 'Filter candidates by university, skills, CGPA & verified readiness', category: 'Pages', icon: Users, targetTab: 'discover-talent', actionLabel: 'Discover Candidates' },
        { id: 'r-apps', title: 'Applications Pipeline', subtitle: 'Track student applicants across Screening, Interview & Offer stages', category: 'Pages', icon: FileText, targetTab: 'applications', actionLabel: 'View Pipeline' },
        { id: 'r-short', title: 'Shortlisted Candidates', subtitle: 'Review top-tier shortlisted candidate profiles & resumes', category: 'Pages', icon: Star, targetTab: 'shortlisted', actionLabel: 'View Shortlisted' },
        { id: 'r-jobs', title: 'Job & Internship Postings', subtitle: 'Manage active campus openings, deadlines & applicant quotas', category: 'Pages', icon: Briefcase, targetTab: 'job-postings', actionLabel: 'Manage Jobs' },
        { id: 'r-post', title: 'Post a New Opportunity', subtitle: 'Draft and publish full-time or internship campus openings', category: 'Pages', icon: Zap, targetTab: 'post-job', actionLabel: 'Create Posting' },
        { id: 'r-interviews', title: 'Interview Management', subtitle: 'Scheduled technical & HR rounds, meeting links and interviewers', category: 'Pages', icon: Video, targetTab: 'interviews', actionLabel: 'View Schedule' },
        { id: 'r-drives', title: 'Campus Placement Drives', subtitle: 'Coordinate university recruitment drives, test dates & shortlists', category: 'Pages', icon: Building, targetTab: 'campus-drives', actionLabel: 'View Drives' },
        { id: 'r-internships', title: 'Internship Programs', subtitle: 'Structured semester-long and summer corporate internship tracks', category: 'Pages', icon: GraduationCap, targetTab: 'internship-programs', actionLabel: 'View Programs' },
        { id: 'r-collab', title: 'University Partnerships & MOUs', subtitle: 'Institutional collaborations, guest talks & hackathon partnerships', category: 'Pages', icon: Handshake, targetTab: 'university-collaboration', actionLabel: 'View Partnerships' },
        { id: 'r-live', title: 'Live Industry Projects', subtitle: 'Sponsor capstone student development projects with university faculty', category: 'Pages', icon: Code, targetTab: 'live-projects', actionLabel: 'Explore Projects' },
        { id: 'r-research', title: 'R&D & Research Opportunities', subtitle: 'Collaborate with university researchers on funded research initiatives', category: 'Pages', icon: Sparkles, targetTab: 'research-opportunities', actionLabel: 'View R&D' },
        { id: 'r-analytics', title: 'Recruitment Analytics & Insights', subtitle: 'Hiring funnel conversion rates, campus distribution & offer ratios', category: 'Pages', icon: TrendingUp, targetTab: 'analytics', actionLabel: 'View Analytics' },
        { id: 'r-messages', title: 'Messages & Inquiries', subtitle: 'Direct communication with placement cells and candidates', category: 'Pages', icon: FileCheck, targetTab: 'messages', actionLabel: 'Open Inbox' },
        { id: 'r-profile', title: 'Company Profile & Branding', subtitle: 'Manage corporate brand identity, campus perks and about page', category: 'Pages', icon: Building, targetTab: 'company-profile', actionLabel: 'Edit Profile' }
      );

      // Candidates
      mockCandidates.forEach(c => {
        items.push({
          id: `cand-${c.id}`,
          title: c.name,
          subtitle: `${c.dept} • Class of ${c.gradYear} • CGPA ${c.cgpa} • Skills: ${c.skills.join(', ')}`,
          category: 'Candidates',
          icon: Users,
          tag: `${c.match}% Match`,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badge: `Readiness ${c.readiness}%`,
          targetTab: 'discover-talent',
          actionLabel: 'View Candidate Profile'
        });
      });

      // Job Postings
      mockJobs.forEach(j => {
        items.push({
          id: `job-${j.id}`,
          title: j.title,
          subtitle: `${j.company} • ${j.location} (${j.type}) • ${j.stipend} • ${j.openings} openings • ${j.apps} apps`,
          category: 'Jobs',
          icon: Briefcase,
          tag: j.stipend,
          tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          badge: j.status,
          targetTab: 'job-postings',
          actionLabel: 'Manage Job'
        });
      });

      // Campus Drives
      mockDrives.forEach(d => {
        items.push({
          id: `drive-${d.id}`,
          title: `${d.name} (${d.company})`,
          subtitle: `Date: ${d.date} • ${d.reg} registered • ${d.short} shortlisted • ${d.sel} selected`,
          category: 'Drives',
          icon: Building,
          tag: d.status,
          tagColor: d.status === 'Ongoing' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          targetTab: 'campus-drives',
          actionLabel: 'Inspect Campus Drive'
        });
      });

      // Applications
      mockApplications.forEach(a => {
        items.push({
          id: `app-${a.id}`,
          title: `${a.cand} — ${a.job}`,
          subtitle: `Applied on ${a.date} • Match Score: ${a.match}% • Current Stage: ${a.stage}`,
          category: 'Applications',
          icon: FileText,
          tag: a.stage,
          tagColor: a.stage === 'Selected' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : a.stage === 'Interview' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          targetTab: a.stage === 'Shortlisted' ? 'shortlisted' : 'applications',
          actionLabel: 'Review Application'
        });
      });

      // Interviews
      mockInterviews.forEach(i => {
        items.push({
          id: `int-${i.id}`,
          title: `${i.cand} (${i.round} Round)`,
          subtitle: `${i.job} • ${i.date} at ${i.time} • Interviewer: ${i.interviewer} (${i.mode})`,
          category: 'Interviews',
          icon: Video,
          tag: i.time,
          tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          badge: i.mode,
          targetTab: 'interviews',
          actionLabel: 'Open Interview Call'
        });
      });
    }

    // ==========================================
    // 3. HOD / FACULTY PORTAL DATA
    // ==========================================
    else if (currentRole === 'hod') {
      // Navigation Pages
      items.push(
        { id: 'f-dash', title: 'HOD Overview & Governance', subtitle: 'Faculty development, department performance & NIRF compliance', category: 'Pages', icon: Layers, targetTab: 'dashboard', actionLabel: 'Open Dashboard' },
        { id: 'f-curr', title: 'AI Curriculum Alignment Engine', subtitle: 'NEP 2020 syllabus benchmarking with IEEE & ACM standards', category: 'Pages', icon: Sparkles, targetTab: 'curriculum-alignment', actionLabel: 'Audit Curriculum' },
        { id: 'f-intern', title: 'Faculty Industry Immersion & Sabbaticals', subtitle: 'Corporate industry sabbaticals, stipends & research attachments', category: 'Pages', icon: Briefcase, targetTab: 'faculty-internships', actionLabel: 'Explore Immersion' },
        { id: 'f-fdp', title: 'FDP & Pedagogical Upskilling Programs', subtitle: 'AICTE ATAL faculty development programs & international certifications', category: 'Pages', icon: GraduationCap, targetTab: 'fdp-programs', actionLabel: 'Browse FDPs' },
        { id: 'f-live', title: 'Live Industry Student Projects', subtitle: 'Corporate sponsored student development projects & capstone mentoring', category: 'Pages', icon: Code, targetTab: 'live-projects', actionLabel: 'View Projects' },
        { id: 'f-work', title: 'Workshops & Guest Lectures Hub', subtitle: 'Organize expert industry sessions, webinars & hands-on workshops', category: 'Pages', icon: Users, targetTab: 'workshops', actionLabel: 'Manage Sessions' },
        { id: 'f-mente', title: 'Student Capstone Mentorship', subtitle: 'Undergraduate student capstone project monitoring & repo reviews', category: 'Pages', icon: Award, targetTab: 'student-mentorship', actionLabel: 'Inspect Mentees' },
        { id: 'f-mou', title: 'Automated Institutional MOU Generator', subtitle: 'Legal AI MOU generation with Tier-1 industry partners', category: 'Pages', icon: Handshake, targetTab: 'auto-mou', actionLabel: 'Draft MOU' },
        { id: 'f-swap', title: 'Faculty Exchange & Cross-University Swap', subtitle: 'Visiting professorships with IITs, NITs and international universities', category: 'Pages', icon: Handshake, targetTab: 'faculty-swap', actionLabel: 'Explore Swaps' },
        { id: 'f-apps', title: 'My Grant & Sabbatical Applications', subtitle: 'Track institutional clearance for DST, AICTE and patent filings', category: 'Pages', icon: FileText, targetTab: 'my-applications', actionLabel: 'View Applications' },
        { id: 'f-collab', title: 'My Institutional Collaborations', subtitle: 'Active research and technical partnerships across sectors', category: 'Pages', icon: Building, targetTab: 'my-collaborations', actionLabel: 'View Collaborations' },
        { id: 'f-achieve', title: 'Faculty Achievements & Verified Certificates', subtitle: 'Digitally verified credentials, IEEE honors and state awards', category: 'Pages', icon: Award, targetTab: 'achievements', actionLabel: 'View Credentials' },
        { id: 'f-intel', title: 'Academic Intelligence Engine', subtitle: 'Scopus citations, h-index trajectories & NAAC Criterion 3 analytics', category: 'Pages', icon: TrendingUp, targetTab: 'academic-intelligence', actionLabel: 'View Intelligence' },
        { id: 'f-advisor', title: 'AI Faculty Career Advisor', subtitle: 'Intelligent roadmap generation for tenure, publications and research funding', category: 'Pages', icon: Lightbulb, targetTab: 'ai-faculty-advisor', actionLabel: 'Launch Advisor' }
      );

      // Research Collaborations & Grants
      getStoredResearchCollaborations().forEach(r => {
        items.push({
          id: `res-${r.id}`,
          title: r.title,
          subtitle: `${r.partnerInstitution} • ${r.fundingAgency} • ${r.grantAmountFormatted} (${r.duration})`,
          category: 'Research & Grants',
          icon: Sparkles,
          tag: r.grantAmountFormatted,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badge: r.status,
          targetTab: 'collaboration-hub',
          actionLabel: 'View Research Dossier'
        });
      });

      // Live Projects
      getStoredLiveProjects().forEach(p => {
        items.push({
          id: `proj-${p.id}`,
          title: p.title,
          subtitle: `${p.companyPartner} • ${p.studentTeamLead} • ${p.techStack.slice(0, 3).join(', ')} • ${p.stipendPerStudentFormatted}`,
          category: 'Live Projects',
          icon: Code,
          tag: p.phase,
          tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          badge: p.status,
          targetTab: 'live-projects',
          actionLabel: 'Inspect Project'
        });
      });

      // Student Mentees
      getStoredMentorshipProfiles().forEach(m => {
        items.push({
          id: `mentee-${m.id}`,
          title: `${m.studentName} — ${m.projectTitle}`,
          subtitle: `${m.department} (${m.academicYear}) • Milestone: ${m.nextMilestoneTitle} • ${m.progressPercentage}% Done`,
          category: 'Mentees',
          icon: Users,
          tag: `${m.progressPercentage}% Progress`,
          tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          badge: m.status,
          targetTab: 'student-mentorship',
          actionLabel: 'Review Capstone'
        });
      });

      // FDP Programs
      getStoredFdpPrograms().forEach(fdp => {
        items.push({
          id: `fdp-${fdp.id}`,
          title: fdp.title,
          subtitle: `${fdp.organizingBody} • ${fdp.mode} • ${fdp.duration} • Resource: ${fdp.resourcePerson}`,
          category: 'FDPs & Workshops',
          icon: GraduationCap,
          tag: fdp.status,
          tagColor: fdp.status === 'Open for Registration' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          badge: fdp.type,
          targetTab: 'fdp-programs',
          actionLabel: 'View FDP Program'
        });
      });

      // Consultancy Projects
      getStoredConsultancies().forEach(con => {
        items.push({
          id: `con-${con.id}`,
          title: con.projectTitle,
          subtitle: `${con.clientOrganization} • Lead: ${con.facultyLead} • Value: ${con.consultancyValueFormatted}`,
          category: 'Research & Grants',
          icon: Briefcase,
          tag: con.consultancyValueFormatted,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badge: con.status,
          targetTab: 'consultancy',
          actionLabel: 'View Consultancy'
        });
      });

      // My Applications
      getStoredFacultyApplications().forEach(a => {
        items.push({
          id: `fac-app-${a.id}`,
          title: a.title,
          subtitle: `${a.type} • ${a.organizationOrAgency} • Submitted: ${a.submissionDate} • Current: ${a.status}`,
          category: 'My Applications',
          icon: FileText,
          tag: a.status,
          tagColor: a.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : a.status === 'Under Review' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          targetTab: 'my-applications',
          actionLabel: 'Track Application'
        });
      });

      // My Collaborations
      getStoredFacultyCollaborations().forEach(c => {
        items.push({
          id: `fac-col-${c.id}`,
          title: `${c.partnerName} (${c.partnerType})`,
          subtitle: `Role: ${c.facultyRole} • ${c.duration} • Focus: ${c.focusArea}`,
          category: 'My Collaborations',
          icon: Handshake,
          tag: c.status,
          tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          targetTab: 'my-collaborations',
          actionLabel: 'View Partnership'
        });
      });

      // Achievements & Certificates
      getStoredFacultyAchievements().forEach(ac => {
        items.push({
          id: `fac-ach-${ac.id}`,
          title: ac.title,
          subtitle: `${ac.issuingBody} • ${ac.category} • Conferred: ${ac.dateReceived}`,
          category: 'Achievements',
          icon: Award,
          tag: ac.category,
          tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          badge: ac.verificationBadge,
          targetTab: 'achievements',
          actionLabel: 'View Certificate'
        });
      });

      // Workshops
      getStoredWorkshops().forEach(w => {
        items.push({
          id: `wk-${w.id}`,
          title: w.title,
          subtitle: `${w.speakerName} (${w.speakerDesignation}) • ${w.domain} • Date: ${w.date}`,
          category: 'FDPs & Workshops',
          icon: BookOpen,
          tag: w.eventType,
          tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
          targetTab: 'workshops',
          actionLabel: 'View Workshop'
        });
      });
    }

    // ==========================================
    // 4. MENTOR PORTAL DATA
    // ==========================================
    else if (currentRole === 'mentor') {
      // Navigation Pages
      items.push(
        { id: 'm-pipe', title: 'Student Mentee Pipeline', subtitle: 'Track active mentees across diagnostic, capsule & milestone stages', category: 'Pages', icon: Layers, targetTab: 'mentor-pipeline', actionLabel: 'View Pipeline' },
        { id: 'm-caps', title: '15-Minute 1-on-1 Capsules', subtitle: 'Manage confirmed student bookings, topics and meeting links', category: 'Pages', icon: Video, targetTab: 'mentor-capsules', actionLabel: 'Manage Bookings' },
        { id: 'm-revs', title: 'Code Reviews & Milestone Approvals', subtitle: 'Inspect student GitHub submissions and mint cryptographic passport stamps', category: 'Pages', icon: ShieldCheck, targetTab: 'mentor-reviews', actionLabel: 'Review PRs' },
        { id: 'm-post', title: 'Publish Industry Micro-Task / Gig', subtitle: 'Post real-world paid micro-internship tasks for university students', category: 'Pages', icon: Briefcase, targetTab: 'postgig', actionLabel: 'Create Task' }
      );

      // Booked Capsules
      const capsuleItems = [
        { id: 'cap-1', studentName: 'Adarsh Pratap Singh', college: 'MJPRU Bareilly (CSIT)', topic: 'Express JWT Middleware & Rate Limiting Review', timeSlot: 'Today, 4:00 PM (15 Mins)', status: 'Confirmed' },
        { id: 'cap-2', studentName: 'Neha Sharma', college: 'IET Lucknow', topic: 'PostgreSQL Indexing & High Concurrency Design', timeSlot: 'Tomorrow, 11:30 AM (15 Mins)', status: 'Confirmed' },
        { id: 'cap-3', studentName: 'Rohan Joshi', college: 'KNIT Sultanpur', topic: 'Frontend State Architecture & Realtime WebSockets', timeSlot: 'Thursday, 3:00 PM (30 Mins)', status: 'Confirmed' },
        { id: 'cap-4', studentName: 'Meera Iyer', college: 'College of Engineering Guindy', topic: 'API Threat Modeling & Zero-Trust Authentication', timeSlot: 'Friday, 4:30 PM (15 Mins)', status: 'Confirmed' }
      ];

      capsuleItems.forEach(c => {
        items.push({
          id: `cap-${c.id}`,
          title: `${c.studentName} — ${c.topic}`,
          subtitle: `${c.college} • Slot: ${c.timeSlot}`,
          category: 'Capsules',
          icon: Video,
          tag: c.timeSlot.split('(')[0].trim(),
          tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          badge: c.status,
          targetTab: 'mentor-capsules',
          actionLabel: 'Open Capsule Slot'
        });
      });

      // Mentees in Pipeline
      const menteeList = [
        { id: 'mt-1', name: 'Aarav Singh', course: 'B.Tech CSE 2027', role: 'Full-Stack Engineer', readiness: 92, nextAction: 'Review PR: Kafka Event Bus Architecture' },
        { id: 'mt-2', name: 'Ananya Gupta', course: 'B.Tech IT 2026', role: 'Machine Learning Engineer', readiness: 95, nextAction: 'Review Milestone: PyTorch Quantization' },
        { id: 'mt-3', name: 'Rohan Verma', course: 'B.Tech CSE 2027', role: 'Backend Systems Engineer', readiness: 86, nextAction: 'Schedule 15-Min Capsule: Redis Locks' },
        { id: 'mt-4', name: 'Kunal Mehta', course: 'B.Tech CSE 2027', role: 'Frontend Architect', readiness: 87, nextAction: 'Code Review: React 18 Concurrent Rendering' }
      ];

      menteeList.forEach(m => {
        items.push({
          id: `mentee-p-${m.id}`,
          title: `${m.name} (${m.role})`,
          subtitle: `${m.course} • Readiness: ${m.readiness}% • Next: ${m.nextAction}`,
          category: 'Mentees',
          icon: Users,
          tag: `${m.readiness}% Ready`,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          targetTab: 'mentor-pipeline',
          actionLabel: 'View Mentee Progress'
        });
      });

      // Code Reviews
      const reviewsList = [
        { id: 'rev-1', title: 'Distributed Event Bus with Redis Streams', student: 'Aarav Singh', time: '1 hr ago', status: 'Pending Verification' },
        { id: 'rev-2', title: 'ONNX Runtime Inference Acceleration', student: 'Ananya Gupta', time: '3 hrs ago', status: 'Pending Verification' },
        { id: 'rev-3', title: 'High-Concurrency PostgreSQL Partitioning', student: 'Neha Sharma', time: 'Yesterday', status: 'Approved' }
      ];

      reviewsList.forEach(r => {
        items.push({
          id: `rev-${r.id}`,
          title: r.title,
          subtitle: `Submitted by ${r.student} • ${r.time} • Status: ${r.status}`,
          category: 'Reviews',
          icon: ShieldCheck,
          tag: r.status,
          tagColor: r.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          targetTab: 'mentor-reviews',
          actionLabel: 'Review Code & Mint Badge'
        });
      });
    }

    return items;
  }, [currentRole, gigs, mentors, passport]);

  // Categories available for active portal
  const portalCategories = useMemo(() => {
    const cats = new Set<string>();
    allPortalItems.forEach(item => cats.add(item.category));
    return ['All', ...Array.from(cats)];
  }, [allPortalItems]);

  // Filtered Search Results based on Query & Category
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return allPortalItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q)) ||
        (item.tag && item.tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allPortalItems, searchQuery, selectedCategory]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K & Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd + K or Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }

      // Arrow navigation in results
      if (isOpen && filteredResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex(prev => (prev + 1) % filteredResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const selected = filteredResults[highlightedIndex];
          if (selected) {
            handleItemSelect(selected);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, highlightedIndex]);

  // Reset highlight index on filter change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, selectedCategory]);

  // Handle Result Selection
  const handleItemSelect = (item: SearchResultItem) => {
    onNavigateTab(item.targetTab);
    if (item.onSelect) {
      item.onSelect();
    }
    setIsOpen(false);
    onShowToast(`Opened ${item.category}: "${item.title}"`, 'success');
  };

  // Quick Suggestion Click
  const handleSuggestionClick = (sug: { text: string; tab: string }) => {
    setSearchQuery(sug.text);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  // Helper to Highlight Matching Substring
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-cyan-300 font-black bg-cyan-500/20 px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const RoleIcon = roleInfo.icon;

  return (
    <div ref={searchContainerRef} className="relative flex-1 min-w-0">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-[#2B2520]/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholderText}
          className="w-full bg-[#D6CCA8] border border-[#2B2520]/20 focus:border-[#2B2520] text-[#2B2520] placeholder-[#2B2520]/60 text-xs rounded-xl pl-8 pr-16 py-1.5 sm:py-2 outline-none transition-all shadow-inner truncate"
        />

        {/* Right Badges / Shortcut / Clear button */}
        <div className="absolute right-2 flex items-center gap-1.5 pointer-events-auto">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-[#2B2520]/80 hover:text-black hover:bg-black/10 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#B39F84] border border-[#2B2520]/20 text-[10px] text-[#2B2520]/90 font-mono">
              <span className="text-[9px]">⌘</span>K
            </div>
          )}
        </div>
      </div>

      {/* DROPDOWN POPOVER OVERLAY */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#D6CCA8] border border-[#2B2520]/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-scale-up min-w-[320px] sm:min-w-[480px] max-h-[80vh] flex flex-col text-[#2B2520]">
          {/* Header Bar */}
          <div className="p-3 bg-[#B39F84] border-b border-[#2B2520]/15 flex items-center justify-between gap-2 text-[#2B2520]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border bg-[#D6CCA8] border-[#2B2520]/20 text-[#2B2520]`}>
                <RoleIcon className="w-3 h-3" />
                <span>{roleInfo.name}</span>
              </span>
              <span className="text-[11px] text-[#2B2520]/80">
                {searchQuery ? `${filteredResults.length} matches` : 'Global Omnisearch'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#2B2520]/70">
              <span className="hidden sm:inline">Use <kbd className="px-1 py-0.5 rounded bg-[#D6CCA8] text-[#2B2520] font-mono border border-[#2B2520]/20">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-[#D6CCA8] text-[#2B2520] font-mono border border-[#2B2520]/20">↓</kbd> to navigate</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#2B2520]/70 hover:text-black hover:bg-[#D6CCA8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          {searchQuery && portalCategories.length > 1 && (
            <div className="px-3 py-2 bg-[#C9BE98] border-b border-[#2B2520]/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {portalCategories.map(cat => {
                const count = cat === 'All'
                  ? allPortalItems.filter(i => {
                      const q = searchQuery.toLowerCase();
                      return i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q);
                    }).length
                  : allPortalItems.filter(i => {
                      const q = searchQuery.toLowerCase();
                      return i.category === cat && (i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
                    }).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-[#2B2520] text-[#D6CCA8] shadow-sm border border-[#1E1A16]'
                        : 'bg-[#D6CCA8] text-[#2B2520] hover:bg-[#DFD7B7] border border-[#2B2520]/20'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/10 font-mono">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Results List / Suggested Searches */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] p-2 space-y-1 divide-y divide-[#2B2520]/10">
            {searchQuery ? (
              filteredResults.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Search className="w-8 h-8 text-[#2B2520]/40 mx-auto" />
                  <p className="text-sm font-bold text-[#2B2520]">No matches found in {roleInfo.name}</p>
                  <p className="text-xs text-[#2B2520]/70 max-w-xs mx-auto">
                    Try refining your keyword or explore suggested topics below.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    {popularSuggestions.slice(0, 4).map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="px-2.5 py-1 rounded-lg bg-[#C9BE98] hover:bg-[#2B2520] hover:text-[#D6CCA8] text-xs text-[#2B2520] border border-[#2B2520]/20 transition-colors"
                      >
                        {sug.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isHighlighted
                          ? 'bg-[#DFD7B7] border border-[#2B2520]/30 shadow-md'
                          : 'hover:bg-[#C9BE98] border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-[#C9BE98] border border-[#2B2520]/15 text-[#2B2520] shrink-0 mt-0.5">
                          <ItemIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#2B2520] truncate">
                              {highlightMatch(item.title, searchQuery)}
                            </span>

                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#C9BE98] text-[#2B2520] border border-[#2B2520]/20">
                              {item.category}
                            </span>

                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#C9BE98] text-[#2B2520]/80 border border-[#2B2520]/20">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[#2B2520]/70 truncate mt-0.5">
                            {highlightMatch(item.subtitle, searchQuery)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.tag && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${item.tagColor || 'text-[#2B2520] bg-[#C9BE98] border-[#2B2520]/20'}`}>
                            {item.tag}
                          </span>
                        )}

                        <button
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                            isHighlighted
                              ? 'bg-[#2B2520] text-[#D6CCA8] shadow'
                              : 'bg-[#C9BE98] text-[#2B2520] hover:bg-[#2B2520] hover:text-[#D6CCA8]'
                          }`}
                        >
                          <span>{item.actionLabel || 'Jump'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Suggested / Popular Topics when query is empty */
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2520]/70 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#2B2520]" />
                  <span>Popular Searches & Quick Navigation in {roleInfo.name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="p-2.5 rounded-xl bg-[#C9BE98] hover:bg-[#DFD7B7] border border-[#2B2520]/15 hover:border-[#2B2520] text-left transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-[#2B2520] group-hover:text-black truncate">
                          {sug.text}
                        </div>
                        <div className="text-[10px] text-[#2B2520]/60">{sug.category}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2B2520]/50 group-hover:text-[#2B2520] transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Quick Portal Navigation Links */}
                <div className="pt-2 border-t border-[#2B2520]/15">
                  <div className="text-[11px] font-bold text-[#2B2520]/70 mb-2">Explore Primary Modules:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {allPortalItems
                      .filter(i => i.category === 'Pages')
                      .slice(0, 6)
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleItemSelect(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#C9BE98] hover:bg-[#2B2520] hover:text-[#D6CCA8] border border-[#2B2520]/15 text-[11px] font-medium text-[#2B2520] transition-colors"
                        >
                          {p.title}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-[#B39F84] border-t border-[#2B2520]/15 flex items-center justify-between text-[10px] text-[#2B2520]/70 px-4">
            <div className="flex items-center gap-1">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-[#D6CCA8] text-[#2B2520] font-mono border border-[#2B2520]/20">↵ Enter</kbd> to select</span>
            </div>
            <div>
              <span>Searching real-time {roleInfo.name} database</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
