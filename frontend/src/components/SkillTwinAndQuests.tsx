import React, { useState, useEffect } from 'react';
import { Flame, Target, Check, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Quest {
  id: string;
  title: string;
  time: string;
  xp: number;
  completed: boolean;
}

interface UserProfile {
  name: string;
  batch: string;
  email: string;
}

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q1', title: 'Solve 1 PostgreSQL indexing', time: '15min', xp: 50, completed: false },
  { id: 'q2', title: 'Watch Mentor Capsule JWT', time: '2min', xp: 20, completed: false },
  { id: 'q3', title: 'Place bid Micro-Gig', time: '5min', xp: 30, completed: false }
];

export const SkillTwinAndQuests: React.FC = () => {
  const [xp, setXp] = useState(650);
  const [streak, setStreak] = useState(5);
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [floatingXp, setFloatingXp] = useState<{ id: string; amount: number } | null>(null);

  const [user, setUser] = useState<UserProfile>({
    name: 'Loading...',
    batch: 'CSIT 2025-29',
    email: ''
  });

  useEffect(() => {
    const savedXp = localStorage.getItem('skillTwinXP');
    if (savedXp) setXp(parseInt(savedXp, 10));

    const savedStreak = localStorage.getItem('dailyStreak');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));

    const savedDate = localStorage.getItem('questDate');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      localStorage.setItem('questDate', today);
      setQuests(DEFAULT_QUESTS);
      localStorage.setItem('dailyQuests', JSON.stringify(DEFAULT_QUESTS));
    } else {
      const savedQuests = localStorage.getItem('dailyQuests');
      if (savedQuests) setQuests(JSON.parse(savedQuests));
    }

    let foundName = '';
    let foundBatch = '';
    let foundEmail = '';

    for (const key of ['user', 'authUser', 'studentProfile']) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed) {
            if (parsed.name) foundName = parsed.name;
            if (parsed.batch) foundBatch = parsed.batch;
            if (parsed.email) foundEmail = parsed.email;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }

    if (!foundName) {
      const uName = localStorage.getItem('userName');
      if (uName) foundName = uName;
    }

    if (!foundEmail) {
      const uEmail = localStorage.getItem('userEmail');
      if (uEmail) foundEmail = uEmail;
    }

    if (!foundBatch) {
      const uBatch = localStorage.getItem('userBatch');
      if (uBatch) foundBatch = uBatch;
    }

    if (!foundName && foundEmail) {
      foundName = foundEmail.split('@')[0];
      foundName = foundName.charAt(0).toUpperCase() + foundName.slice(1);
    }

    if (!foundName) {
      foundName = 'Student';
    }

    setUser({
      name: foundName,
      batch: foundBatch || 'CSIT 2025-29',
      email: foundEmail || ''
    });
  }, []);

  const handleComplete = (id: string, xpReward: number) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    const newQuests = quests.map(q => q.id === id ? { ...q, completed: true } : q);
    setQuests(newQuests);
    localStorage.setItem('dailyQuests', JSON.stringify(newQuests));

    const oldLevel = Math.floor(xp / 200) + 1;
    const newXp = xp + xpReward;
    const newLevel = Math.floor(newXp / 200) + 1;

    setXp(newXp);
    localStorage.setItem('skillTwinXP', newXp.toString());

    setFloatingXp({ id, amount: xpReward });
    setTimeout(() => setFloatingXp(null), 1000);

    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C5CFC', '#00D9FF', '#FFFFFF']
      });
    }

    if (newQuests.every(q => q.completed)) {
      const today = new Date().toDateString();
      const lastStreakUpdate = localStorage.getItem('lastStreakUpdate');
      if (lastStreakUpdate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('dailyStreak', newStreak.toString());
        localStorage.setItem('lastStreakUpdate', today);
      }
    }
  };

  const level = Math.floor(xp / 200) + 1;
  const progress = ((xp % 200) / 200) * 100;
  const progressWidth = progress + '%';
  const title = level <= 3 ? 'Fresher' : level <= 6 ? 'Builder' : 'Expert';
  const filledDots = streak > 0 ? ((streak - 1) % 7) + 1 : 0;

  const getDisplayName = (fullName: string) => {
    if (fullName.length > 22) {
      const words = fullName.trim().split(/\s+/);
      if (words.length >= 2) {
        return `${words[0]} ${words[1]}`;
      }
    }
    return fullName;
  };

  const avatarSeed = user.name.replace(/\s+/g, '');
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=1A1F3D`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-sans select-none">
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-float-up { animation: floatUp 0.8s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      {/* Component 1: Skill Twin */}
      <div className="relative bg-gradient-to-br from-[#12162E] to-[#1A1F3D] border border-white/10 rounded-[20px] p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-[#7C5CFC]/15 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-[84px] h-[84px] rounded-[18px] bg-[#0B0F2A] border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#7C5CFC] rounded-full border-2 border-[#12162E] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              {level}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-base truncate">{getDisplayName(user.name)}</h2>
            <p className="text-white/50 text-xs mt-0.5 mb-1.5 truncate">{user.batch}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#00D9FF] uppercase tracking-wider bg-[#00D9FF]/10 px-2 py-0.5 rounded-sm whitespace-nowrap">
                Level {level} {title}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold text-white/60 mb-1.5">
            <span>XP {xp}</span>
            <span>Next Level at {level * 200} XP</span>
          </div>
          <div className="w-full h-[2px] bg-[#0B0F2A] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] rounded-full transition-all duration-500" style={{ width: progressWidth }} />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="text-[11px] font-medium text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:border-[#7C5CFC]/50 hover:bg-[#7C5CFC]/10 transition-colors cursor-default shadow-sm">Python L5 🐍</div>
          <div className="text-[11px] font-medium text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:border-[#7C5CFC]/50 hover:bg-[#7C5CFC]/10 transition-colors cursor-default shadow-sm">PostgreSQL L4 💾</div>
          <div className="text-[11px] font-medium text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:border-[#7C5CFC]/50 hover:bg-[#7C5CFC]/10 transition-colors cursor-default shadow-sm">React L3 ⚛️</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0B0F2A]/50 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-white/40 uppercase font-semibold mb-1">Gigs</span>
            <span className="text-sm font-bold text-white">8</span>
          </div>
          <div className="bg-[#0B0F2A]/50 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-white/40 uppercase font-semibold mb-1">Capsules</span>
            <span className="text-sm font-bold text-white">12</span>
          </div>
          <div className="bg-[#0B0F2A]/50 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-white/40 uppercase font-semibold mb-1">Streak</span>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm font-bold text-white">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Component 2: Daily Quest */}
      <div className="bg-[#12162E] border border-white/10 rounded-[20px] p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00D9FF]" />
            Daily Quests
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filledDots ? 'bg-orange-500 shadow-[0_0_4px_#f97316]' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="flex items-center gap-1 bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-orange-500/20">
              <Flame className="w-3 h-3" />
              {streak}
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          {quests.map(q => (
            <div 
              key={q.id}
              onClick={() => handleComplete(q.id, q.xp)}
              className={`relative group flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-all ${q.completed ? 'bg-[#0B0F2A] opacity-70 cursor-default' : 'bg-[#0B0F2A] hover:bg-[#1A1F3D] cursor-pointer'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.completed ? 'bg-[#7C5CFC] border-[#7C5CFC]' : 'border-white/20 group-hover:border-[#7C5CFC]/50'}`}>
                {q.completed && <Check className="w-3 h-3 text-white" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-semibold text-white truncate transition-all ${q.completed ? 'line-through text-white/40' : ''}`}>{q.title}</h4>
                <p className="text-[10px] text-white/40 mt-0.5">{q.time}</p>
              </div>
              
              <div className="px-2 py-1 rounded bg-[#7C5CFC]/15 text-[#9F87FF] text-[10px] font-bold shrink-0">
                +{q.xp} XP
              </div>
              
              {floatingXp?.id === q.id && (
                <div className="absolute right-4 top-0 text-emerald-400 font-bold text-xs animate-float-up pointer-events-none">
                  +{floatingXp.amount} XP
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF]" />
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#7C5CFC] to-[#00D9FF] rounded-full p-[2px] mb-4 shadow-[0_0_30px_rgba(124,92,252,0.4)]">
              <div className="w-full h-full bg-[#0B0F2A] rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-[#00D9FF]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2">Level Up!</h2>
            <p className="text-slate-300 text-sm mb-6">
              You are now a <strong className="text-[#00D9FF]">Level {level} {title}</strong>. Keep bridging the gap!
            </p>
            
            <button 
              onClick={() => setShowLevelUp(false)}
              className="w-full py-3 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTwinAndQuests;
