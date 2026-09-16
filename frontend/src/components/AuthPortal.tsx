import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Users, 
  Building2, 
  Briefcase,
  ArrowRight,
  Lock,
  Mail,
  User,
  Hash,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Layers,
  Camera,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '../types';
import { 
  UNIS, 
  DEPARTMENTS, 
  MENTOR_COMPANIES_DATA, 
  MENTOR_EXPERTISE_TAGS,
  CollegeItem 
} from '../data/colleges';
import { UniversityDropdown } from './UniversityDropdown';
import { detectAccurateLocation, syncLocationAcrossApp } from '../utils/locationService';
import { Logo } from './Logo';

export interface AuthSuccessPayload {
  name: string;
  role: UserRole;
  email: string;
  department?: string;
  college?: CollegeItem | null;
  batch?: string;
  rollNo?: string;
  company?: string;
  expertise?: string[];
  photo?: string;
  location?: string;
  mode: 'login' | 'register';
}

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (payload: AuthSuccessPayload) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  isOpen,
  onClose,
  initialRole = 'student',
  initialMode = 'login',
  onAuthSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [roleTab, setRoleTab] = useState<'Student' | 'Mentor' | 'HOD' | 'Recruiter'>(() => {
    if (initialRole === 'mentor') return 'Mentor';
    if (initialRole === 'hod') return 'HOD';
    if (initialRole === 'company') return 'Recruiter';
    return 'Student';
  });

  const [photoPreview, setPhotoPreview] = useState<string>(() => {
    return localStorage.getItem('userPhoto') || localStorage.getItem('profilePhoto') || '';
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('Lucknow, Uttar Pradesh, India');

  // --- Student Fields ---
  const [studentName, setStudentName] = useState('Adarsh Pratap Singh');
  const [studentRollNo, setStudentRollNo] = useState('22001015001');
  const [academicYear, setAcademicYear] = useState('2025-29');
  const [studentDept, setStudentDept] = useState(DEPARTMENTS[0]);
  const [studentCollege, setStudentCollege] = useState<CollegeItem>(UNIS[0]);
  const [studentEmail, setStudentEmail] = useState('adarsh.pratap@mjpru.ac.in');
  const [studentPassword, setStudentPassword] = useState('password123');

  // --- Mentor Fields ---
  const [mentorName, setMentorName] = useState('Amit Verma');
  const [mentorEmail, setMentorEmail] = useState('amit.verma@tcs.com');
  const [mentorPassword, setMentorPassword] = useState('password123');
  const [mentorCompanyPreset, setMentorCompanyPreset] = useState(MENTOR_COMPANIES_DATA[0]);
  const [customCompany, setCustomCompany] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([
    'Full Stack',
    'AI/ML',
    'Cloud & DevOps'
  ]);
  const [newTagInput, setNewTagInput] = useState('');

  // --- HOD Fields ---
  const [hodName, setHodName] = useState('Dr. Arvind K. Sharma');
  const [hodEmail, setHodEmail] = useState('hod.csit@mjpru.ac.in');
  const [hodPassword, setHodPassword] = useState('password123');
  const [hodCollege, setHodCollege] = useState<CollegeItem>(UNIS[0]);
  const [hodDept, setHodDept] = useState(DEPARTMENTS[0]);

  // --- Recruiter Fields ---
  const [recruiterName, setRecruiterName] = useState('Priya Sharma');
  const [recruiterCompany, setRecruiterCompany] = useState('Google Cloud India');
  const [recruiterEmail, setRecruiterEmail] = useState('priya.sharma@google.com');
  const [recruiterPassword, setRecruiterPassword] = useState('password123');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      if (initialRole === 'mentor') setRoleTab('Mentor');
      else if (initialRole === 'hod') setRoleTab('HOD');
      else if (initialRole === 'company') setRoleTab('Recruiter');
      else setRoleTab('Student');
      
      const storedPhoto = localStorage.getItem('userPhoto') || localStorage.getItem('profilePhoto') || '';
      setPhotoPreview(storedPhoto);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Toggle expertise tags for mentor
  const toggleExpertise = (tag: string) => {
    if (selectedExpertise.includes(tag)) {
      setSelectedExpertise(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedExpertise(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newTagInput.trim() && !selectedExpertise.includes(newTagInput.trim())) {
      setSelectedExpertise(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  // Photo Upload Handler with FileReader base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      localStorage.setItem('userPhoto', base64);
      localStorage.setItem('profilePhoto', base64);
    };
    reader.readAsDataURL(file);
  };

  // GPS & IP Location auto detector
  const getCurrentLocation = async (): Promise<{ location: string; lat: number; lng: number }> => {
    try {
      const res = await detectAccurateLocation();
      setDetectedLocation(res.location);
      return { 
        location: res.location, 
        lat: res.lat || 28.3670, 
        lng: res.lng || 79.4304 
      };
    } catch {
      const fallback = 'Bareilly, Uttar Pradesh, India';
      setDetectedLocation(fallback);
      return { location: fallback, lat: 28.3670, lng: 79.4304 };
    }
  };

  // CRITICAL PATHWAY AUTH SUBMISSION
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const locData = await getCurrentLocation();

      let form: any = {};
      let targetUserRole: UserRole = 'student';

      if (roleTab === 'Student') {
        form = {
          name: studentName.trim() || 'Adarsh Pratap Singh',
          email: studentEmail.trim() || 'adarsh.pratap@mjpru.ac.in',
          uni: studentCollege.name,
          dept: studentDept,
          roll: studentRollNo.trim() || '22001015001',
          year: academicYear
        };
        targetUserRole = 'student';
      } else if (roleTab === 'Mentor') {
        const comp = customCompany.trim() || mentorCompanyPreset;
        form = {
          name: mentorName.trim() || 'Amit Verma',
          email: mentorEmail.trim() || 'amit.verma@tcs.com',
          company: comp,
          uni: 'Industry Partner',
          dept: 'Software Engineering',
          year: 'N/A'
        };
        targetUserRole = 'mentor';
      } else if (roleTab === 'HOD') {
        form = {
          name: hodName.trim() || 'Dr. Arvind K. Sharma',
          email: hodEmail.trim() || 'hod.csit@mjpru.ac.in',
          uni: hodCollege.name,
          dept: hodDept,
          year: 'N/A'
        };
        targetUserRole = 'hod';
      } else {
        form = {
          name: recruiterName.trim() || 'Priya Sharma',
          email: recruiterEmail.trim() || 'priya.sharma@google.com',
          company: recruiterCompany.trim() || 'Google Cloud India',
          uni: 'Corporate Enterprise',
          dept: 'Recruitment',
          year: 'N/A'
        };
        targetUserRole = 'company';
      }

      // Exact pathway logic requested:
      let profile: any = {
        name: form.name,
        email: form.email,
        college: form.uni,
        department: form.dept,
        photo: photoPreview || localStorage.getItem('userPhoto') || localStorage.getItem('profilePhoto') || '',
        location: locData.location,
        lat: locData.lat,
        lng: locData.lng,
        role: targetUserRole,
        year: form.year
      };

      if (roleTab === 'Student') {
        profile.rollNo = form.roll;
        profile.type = 'Student Candidate';
      } else if (roleTab === 'Mentor') {
        profile.company = form.company;
        profile.type = `Mentor - ${form.company}`;
        delete profile.rollNo;
      } else if (roleTab === 'HOD') {
        profile.type = `HOD - ${form.dept}`;
        delete profile.rollNo; // No roll for HOD
      } else if (roleTab === 'Recruiter') {
        profile.company = form.company;
        profile.type = `Recruiter - ${form.company}`;
        delete profile.rollNo;
      }

      // Persist exact records to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('userRole', roleTab === 'Student' ? 'student' : roleTab === 'Mentor' ? 'Mentor' : roleTab === 'HOD' ? 'HOD' : 'company');
      localStorage.setItem('role', targetUserRole);
      localStorage.setItem('userPhoto', profile.photo);
      localStorage.setItem('profilePhoto', profile.photo);
      localStorage.setItem('userLocation', locData.location);
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);
      
      if (profile.rollNo) {
        localStorage.setItem('userRollNo', profile.rollNo);
      } else {
        localStorage.removeItem('userRollNo');
      }
      
      if (profile.department) localStorage.setItem('userCourse', profile.department);
      if (profile.college) localStorage.setItem('userCollege', profile.college);
      if (profile.year) localStorage.setItem('userYear', profile.year);
      if (profile.company) localStorage.setItem('userCompany', profile.company);

      const payload: AuthSuccessPayload = {
        name: profile.name,
        role: targetUserRole,
        email: profile.email,
        department: profile.department,
        college: roleTab === 'Student' ? studentCollege : roleTab === 'HOD' ? hodCollege : null,
        batch: profile.year,
        rollNo: profile.rollNo,
        company: profile.company,
        expertise: roleTab === 'Mentor' ? selectedExpertise : undefined,
        photo: profile.photo,
        location: profile.location,
        mode: authMode
      };

      onAuthSuccess(payload);
    } catch (err) {
      console.error('Auth submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#EEEBDA] border border-[#282B4A]/30 rounded-2xl shadow-2xl overflow-hidden text-[#282B4A] my-8">
        {/* Header Ribbon & Close Button */}
        <div className="px-4 py-4 border-b border-[#1E2038] flex items-start justify-between bg-[#282B4A] text-[#EEEBDA]">
          <Logo 
            showText={true} 
            subtitle={true} 
            iconSize={36} 
          />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1E2038] border border-[#EEEBDA]/25 hover:border-[#EEEBDA] text-[#EEEBDA] hover:text-white transition-colors cursor-pointer"
            title="Close Portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Switchers: 1. Mode Toggle [Sign In] [Register] + 2. Role Tabs [Student][Mentor][HOD][Recruiter] */}
        <div className="px-6 pt-4 pb-2 space-y-3 bg-[#EEEBDA]">
          {/* Mode Toggle [Sign In] [Register Student / User] */}
          <div className="flex items-center p-1 bg-[#E4E0CE] rounded-xl border border-[#282B4A]/20">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#282B4A] text-[#EEEBDA] shadow-md border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#282B4A] text-[#EEEBDA] shadow-md border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              Register Student / User
            </button>
          </div>

          {/* Role Tabs [Student] [Mentor] [HOD] [Recruiter] - Student Default */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#E4E0CE] rounded-xl border border-[#282B4A]/20">
            <button
              type="button"
              onClick={() => setRoleTab('Student')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === 'Student'
                  ? 'bg-[#282B4A] text-[#EEEBDA] border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleTab('Mentor')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === 'Mentor'
                  ? 'bg-[#282B4A] text-[#EEEBDA] border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleTab('HOD')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === 'HOD'
                  ? 'bg-[#282B4A] text-[#EEEBDA] border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>HOD</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleTab('Recruiter')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === 'Recruiter'
                  ? 'bg-[#282B4A] text-[#EEEBDA] border border-[#1E2038]'
                  : 'text-[#282B4A] hover:text-black'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAuth} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          
          {/* PHOTO UPLOAD & PREVIEW (Available in Register and Login) */}
          <div className="flex flex-col items-center justify-center pb-2">
            <input 
              type="file" 
              accept="image/*" 
              id="photoUpload" 
              className="hidden" 
              onChange={handlePhotoUpload} 
            />
            <label
              htmlFor="photoUpload"
              className="w-20 h-20 rounded-full border-2 border-dashed border-[#282B4A]/40 bg-[#E4E0CE] hover:border-[#282B4A] hover:bg-[#EEEBDA] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative group"
              title="Upload Profile Photo"
            >
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-1">
                  <Camera className="w-5 h-5 text-[#282B4A] group-hover:text-black transition-colors" />
                  <span className="text-[9px] text-[#282B4A] group-hover:text-black mt-1">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </label>
            <span className="text-[10px] text-[#282B4A]/80 mt-1.5">
              Click circle to upload profile photo (PNG, JPG, WebP)
            </span>
          </div>

          {/* 1. STUDENT PATHWAY */}
          {roleTab === 'Student' && (
            <>
              {authMode === 'register' ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Adarsh Pratap Singh"
                          className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        Roll / Student ID
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={studentRollNo}
                          onChange={(e) => setStudentRollNo(e.target.value)}
                          placeholder="e.g. 22001015001"
                          className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        Academic Batch
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] outline-none cursor-pointer"
                        >
                          <option value="2023-27">2023-27 (4th Year / Senior)</option>
                          <option value="2024-28">2024-28 (3rd Year)</option>
                          <option value="2025-29">2025-29 (2nd Year)</option>
                          <option value="2026-30">2026-30 (1st Year / Fresher)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        Department / Branch
                      </label>
                      <select
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] outline-none cursor-pointer"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* University Searchable Dropdown with Original Logos */}
                  <UniversityDropdown
                    selectedCollege={studentCollege}
                    onSelect={(col) => setStudentCollege(col)}
                    label="University Affiliation"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        University / Official Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="adarsh.pratap@mjpru.ac.in"
                          className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Student Login Mode */
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                      Official University Email / Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="adarsh.pratap@mjpru.ac.in"
                        className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                      />
                    </div>
                  </div>

                  <UniversityDropdown
                    selectedCollege={studentCollege}
                    onSelect={(col) => setStudentCollege(col)}
                    label="Associated University"
                  />

                  <div>
                    <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                      Roll Number Verification
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value)}
                        placeholder="22001015001"
                        className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. MENTOR PATHWAY */}
          {roleTab === 'Mentor' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#2C1B2F] border border-[#5E3A5C] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B47A9A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#F3E9EC]/80">
                  <strong className="text-[#F3E9EC]">Industry Mentor Capsule:</strong> Guide students via 1:1 15-minute high-impact capsules, review proof-of-work code, and sponsor micro-internships.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Mentor Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    placeholder="e.g. Amit Verma"
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={mentorEmail}
                      onChange={(e) => setMentorEmail(e.target.value)}
                      placeholder="amit.verma@tcs.com"
                      className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={mentorPassword}
                      onChange={(e) => setMentorPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Enterprise Company & Experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={mentorCompanyPreset}
                    onChange={(e) => setMentorCompanyPreset(e.target.value)}
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] outline-none cursor-pointer"
                  >
                    {MENTOR_COMPANIES_DATA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="Or custom (e.g. Meta - 7 Yrs)"
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Technical Expertise Domains
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {MENTOR_EXPERTISE_TAGS.map((tag) => {
                    const active = selectedExpertise.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleExpertise(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#5E3A5C] border-[#B47A9A] text-[#F3E9EC] font-medium'
                            : 'bg-[#2C1B2F] border-[#5E3A5C] text-[#F3E9EC]/60 hover:text-[#F3E9EC]'
                        }`}
                      >
                        {tag} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. HOD / FACULTY PATHWAY */}
          {roleTab === 'HOD' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#2C1B2F] border border-[#5E3A5C] flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#B47A9A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#F3E9EC]/80">
                  <strong className="text-[#F3E9EC]">Department Head (HOD) Panel:</strong> Institutional accreditation analytics, batch readiness telemetry, syllabus alignment, and placement pipeline tracking.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  HOD / Faculty Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={hodName}
                    onChange={(e) => setHodName(e.target.value)}
                    placeholder="e.g. Dr. Arvind K. Sharma"
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                  />
                </div>
              </div>

              <UniversityDropdown
                selectedCollege={hodCollege}
                onSelect={(col) => setHodCollege(col)}
                label="University / College Affiliation"
              />

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Department Leadership
                </label>
                <select
                  value={hodDept}
                  onChange={(e) => setHodDept(e.target.value)}
                  className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] outline-none cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Official Academic Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={hodEmail}
                      onChange={(e) => setHodEmail(e.target.value)}
                      placeholder="hod.csit@mjpru.ac.in"
                      className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#F3E9EC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={hodPassword}
                      onChange={(e) => setHodPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. RECRUITER PATHWAY */}
          {roleTab === 'Recruiter' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Recruiter Full Name
                </label>
                <input
                  type="text"
                  required
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                  Hiring Organization / Company
                </label>
                <input
                  type="text"
                  required
                  value={recruiterCompany}
                  onChange={(e) => setRecruiterCompany(e.target.value)}
                  placeholder="e.g. Google Cloud India"
                  className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="priya.sharma@google.com"
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F3E9EC]/80 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={recruiterPassword}
                    onChange={(e) => setRecruiterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#2C1B2F] border border-[#5E3A5C] focus:border-[#B47A9A] rounded-xl px-3 py-2 text-xs text-[#F3E9EC] placeholder-[#F3E9EC]/40 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#282B4A] hover:bg-[#1E2038] text-[#EEEBDA] font-bold text-xs tracking-wide transition-all shadow-md shadow-[#282B4A]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing GPS & Profile...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'register'
                      ? roleTab === 'Student'
                        ? 'Register & Sync Profile ->'
                        : roleTab === 'Mentor'
                        ? 'Register as Mentor'
                        : roleTab === 'HOD'
                        ? 'Register as HOD'
                        : 'Register as Recruiter'
                      : roleTab === 'Student'
                      ? 'Sign In to Student OS'
                      : roleTab === 'Mentor'
                      ? 'Sign In to Mentor Capsule'
                      : roleTab === 'HOD'
                      ? 'Sign In to HOD Panel'
                      : 'Sign In to Recruiter Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPortal;
