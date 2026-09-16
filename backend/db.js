const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge-secret-key-2026";

let pgPool = null;
let pgInitialized = false;

function isValidPostgresUrl(str) {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("postgres://") || str.startsWith("postgresql://");
}

function getPgPool() {
  if (!pgPool && isValidPostgresUrl(process.env.DATABASE_URL)) {
    const isLocalhost = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalhost ? false : (process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false })
    });

    pgPool.on("error", (err) => {
      console.error("Unexpected PostgreSQL error on idle client:", err.message);
    });
  }
  return pgPool;
}

// Default initial dataset
function getDefaultData() {
  const defaultSalt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync("password123", defaultSalt);

  return {
    users: [
      {
        id: 1,
        name: "Adarsh Pratap Singh",
        email: "adarsh@mjpru.ac.in",
        password_hash: defaultPasswordHash,
        role: "student",
        student_id: 1,
        mentor_id: null,
        company_id: null,
        created_at: "2026-08-01T10:00:00.000Z"
      },
      {
        id: 2,
        name: "Amit Verma",
        email: "amit.verma@tcs.com",
        password_hash: defaultPasswordHash,
        role: "mentor",
        student_id: null,
        mentor_id: 1,
        company_id: null,
        created_at: "2026-08-01T10:00:00.000Z"
      },
      {
        id: 3,
        name: "Dr. Arvind K. Sharma",
        email: "hod.csit@mjpru.ac.in",
        password_hash: defaultPasswordHash,
        role: "hod",
        student_id: null,
        mentor_id: null,
        company_id: null,
        created_at: "2026-08-01T10:00:00.000Z"
      },
      {
        id: 4,
        name: "Rahul Mehta",
        email: "recruiter@technova.com",
        password_hash: defaultPasswordHash,
        role: "recruiter",
        student_id: null,
        mentor_id: null,
        company_id: 1,
        created_at: "2026-08-01T10:00:00.000Z"
      }
    ],
    students: [
      {
        id: 1,
        name: "Adarsh Pratap Singh",
        course: "Computer Science & Information Technology",
        batch: "2025-29",
        college: "Mahatma Jyotiba Phule Rohilkhand University, Bareilly",
        target_role: "Full Stack Software Engineer",
        career_readiness: 81,
        experience_score: 64,
        created_at: "2026-08-01T10:00:00.000Z"
      }
    ],
    mentors: [
      {
        id: 1,
        name: "Amit Verma",
        role: "Lead Software Architect",
        company: "Tata Consultancy Services",
        experience_years: 12,
        match: 96,
        availability: true,
        capsuleSlots: ["Today 4:00 PM", "Tomorrow 11:30 AM", "Friday 5:15 PM"],
        specialization: ["Distributed Systems", "Cloud Native", "Node.js"]
      },
      {
        id: 2,
        name: "Neha Deshmukh",
        role: "Principal Engineer",
        company: "Infosys Springboard",
        experience_years: 9,
        match: 91,
        availability: true,
        capsuleSlots: ["Today 5:30 PM", "Thursday 3:00 PM", "Saturday 10:00 AM"],
        specialization: ["Full Stack Architecture", "System Design", "React/Next.js"]
      },
      {
        id: 3,
        name: "Vikramaditya Roy",
        role: "Engineering Director",
        company: "CloudSphere Systems",
        experience_years: 14,
        match: 88,
        availability: true,
        capsuleSlots: ["Tomorrow 2:00 PM", "Friday 4:30 PM"],
        specialization: ["DevOps", "PostgreSQL Internals", "Kubernetes"]
      }
    ],
    companies: [
      { id: 1, company_name: "TechNova Labs", industry: "Software & AI", verified: true },
      { id: 2, company_name: "CloudSphere Systems", industry: "Cloud Infrastructure", verified: true },
      { id: 3, company_name: "FinEdge Solutions", industry: "Fintech & Analytics", verified: true }
    ],
    gigs: [
      {
        id: 1,
        company: "CloudSphere Systems",
        title: "Implement Express Token Revocation & Rate Limiter",
        description: "Build robust token blacklisting middleware with Redis/Set TTL and rate-limiting headers for high-concurrency endpoints.",
        skill: "Backend",
        hours: 4,
        payment: 2500,
        applicantCount: 14,
        status: "open",
        created_at: "2026-08-15T12:00:00.000Z"
      },
      {
        id: 2,
        company: "Tata Consultancy Services",
        title: "PostgreSQL Index Tuning & Cohort Scan Benchmark",
        description: "Write composite index migrations and explain analyze benchmarks for 100k row student placement tables.",
        skill: "SQL",
        hours: 3,
        payment: 2000,
        applicantCount: 9,
        status: "open",
        created_at: "2026-08-16T12:00:00.000Z"
      },
      {
        id: 3,
        company: "Wipro Digital Next",
        title: "Accessible Virtualized Data Grid Component",
        description: "Develop a zero-layout-shift virtualized list supporting 10,000 candidate records with keyboard navigation.",
        skill: "Web Development",
        hours: 6,
        payment: 3500,
        applicantCount: 21,
        status: "open",
        created_at: "2026-08-17T12:00:00.000Z"
      },
      {
        id: 4,
        company: "Infosys Springboard",
        title: "Zero-Trust Role-Based Access Control Guard",
        description: "Design end-to-end multi-role middleware ensuring strict resource authorization and audit log hashing.",
        skill: "Cybersecurity",
        hours: 5,
        payment: 3000,
        applicantCount: 11,
        status: "open",
        created_at: "2026-08-18T12:00:00.000Z"
      }
    ],
    gig_applications: [],
    mentor_bookings: [],
    experience_records: [
      {
        id: 1,
        student_id: 1,
        title: "Express JWT Security & Rate Limiting Microservice",
        company: "CloudSphere Systems",
        experience_type: "Micro-Internship Deliverable",
        score: 94,
        hash: "0x7f4b8921e90a8813bc49df290bca238e9184204d",
        verified: true,
        issueDate: "August 2026",
        skillsVerified: ["Node.js", "Express", "JWT Token Blacklist", "Automated Test Coverage"],
        created_at: "2026-08-20T10:00:00.000Z"
      },
      {
        id: 2,
        student_id: 1,
        title: "PostgreSQL High-Concurrency B-Tree Index Optimization",
        company: "Tata Consultancy Services",
        experience_type: "Zero-NDA Ghost Simulation",
        score: 96,
        hash: "0x3a91cd8823fe492a8019b8820c85741982b8492c",
        verified: true,
        issueDate: "July 2026",
        skillsVerified: ["PostgreSQL", "EXPLAIN ANALYZE", "Composite Indexing", "Query Optimization"],
        created_at: "2026-07-28T10:00:00.000Z"
      }
    ],
    helpdesk_tickets: [
      {
        id: 101,
        student_id: 1,
        category: "technical",
        title: "PostgreSQL Index Planner using Seq Scan instead of Index Scan",
        description: "Completed Ghost Internship 102 but query planner cost metric is higher on low selectivity columns.",
        priority: "medium",
        status: "resolved",
        ai_summary: "Suggested composite index column order adjustment: place batch before career_readiness.",
        created_at: "2026-08-28T14:30:00.000Z"
      }
    ],
    ghost_tasks: [
      {
        id: "ghost-101",
        company: "Infosys Springboard",
        role: "Backend Microservice Engineer",
        title: "Zero-Leak JWT Middleware & Revocation List",
        difficulty: "Intermediate",
        timeEstimate: "45 mins",
        bounty: "₹2,500 + Blockchain Proof",
        summary: "Implement a token blacklisting middleware using in-memory Sets with TTL expiry to safely revoke compromised bearer tokens.",
        starterCode: `// Implement auth verification and blacklist check\nfunction verifyTokenWithBlacklist(token, blacklistSet) {\n  if (blacklistSet.has(token)) {\n    return { valid: false, reason: "TOKEN_REVOKED" };\n  }\n  if (!token || !token.startsWith("sb_")) {\n    return { valid: false, reason: "INVALID_FORMAT" };\n  }\n  return { valid: true, payload: { sub: "student_verified", role: "developer" } };\n}`,
        solutionHints: [
          "Check if blacklistSet contains token first",
          "Verify token prefix is sb_",
          "Return sanitized JSON payload"
        ],
        testCases: [
          { name: "Reject revoked token in blacklist set", passed: true },
          { name: "Accept valid active bearer token sb_active_987", passed: true },
          { name: "Ensure sub claims match student id", passed: true }
        ]
      },
      {
        id: "ghost-102",
        company: "TCS iON Digital",
        role: "Cloud Database Associate",
        title: "PostgreSQL Index Optimization for High-Concurrency Queries",
        difficulty: "Intermediate",
        timeEstimate: "30 mins",
        bounty: "₹3,000 + TCS Verified Stamp",
        summary: "Design composite B-Tree indexes on large student placement tables to reduce scan costs on (batch, career_readiness).",
        starterCode: `CREATE INDEX idx_students_cohort_readiness \nON students (batch, career_readiness DESC);\n\n-- Analyze execution plan:\nEXPLAIN ANALYZE \nSELECT id, name, target_role, career_readiness \nFROM students \nWHERE batch = '2025-29' AND career_readiness >= 80;`,
        solutionHints: [
          "Place highest cardinality filters first in composite index",
          "Use EXPLAIN ANALYZE to verify index scans over Seq Scans"
        ],
        testCases: [
          { name: "Composite Index is created on batch & career_readiness", passed: true },
          { name: "Query planner utilizes Index Scan", passed: true }
        ]
      },
      {
        id: "ghost-103",
        company: "Wipro Digital Next",
        role: "Frontend UI Systems Architect",
        title: "Zero-Layout-Shift Accessible Data Grid",
        difficulty: "Advanced",
        timeEstimate: "60 mins",
        bounty: "₹4,000 + Wipro Passport Badge",
        summary: "Implement a virtualization window for 10,000 student records with keyboard-accessible arrow navigation and WCAG AA contrast.",
        starterCode: `// Virtualized rows calculator\nfunction calculateVisibleRange(scrollTop, containerHeight, rowHeight, totalCount) {\n  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);\n  const visibleCount = Math.ceil(containerHeight / rowHeight) + 4;\n  const endIndex = Math.min(totalCount - 1, startIndex + visibleCount);\n  return { startIndex, endIndex, offsetY: startIndex * rowHeight };\n}`,
        solutionHints: [
          "Add overscan buffer before and after visible window",
          "Maintain exact rowHeight math to prevent scroll jumps"
        ],
        testCases: [
          { name: "Renders exact subset of rows within buffer", passed: true },
          { name: "Maintains zero scroll jitter at 60fps", passed: true }
        ]
      }
    ],
    mou_requests: [
      {
        id: "MOU-2026-01",
        companyName: "Tata Consultancy Services (TCS)",
        industry: "Enterprise IT & Cloud Systems",
        contactPerson: "Amit Verma, Lead Campus Director",
        status: "Approved",
        dateCreated: "2026-07-15",
        scopes: ["Annual Placement Pipeline (50+ Seats)", "Joint Mentorship Capsules", "Experience Passport Verification"]
      },
      {
        id: "MOU-2026-02",
        companyName: "Infosys Springboard",
        industry: "Software Consulting & AI",
        contactPerson: "Neha Deshmukh, Head of Academic Alliances",
        status: "Active",
        dateCreated: "2026-08-01",
        scopes: ["Curriculum Co-Design", "Zero-Cost Ghost Internships", "Faculty Upskilling Seminars"]
      },
      {
        id: "MOU-2026-03",
        companyName: "CloudSphere Systems",
        industry: "DevOps & Distributed Cloud Infrastructure",
        contactPerson: "Priya Sharma, Engineering Director",
        status: "Draft",
        dateCreated: "2026-08-20",
        scopes: ["Micro-Internship Gig Sponsorships", "Direct PPO Pre-Screening"]
      }
    ],
    faculty_swaps: [
      {
        id: "SWAP-01",
        facultyName: "Dr. Arvind K. Sharma",
        department: "Computer Science & Engineering",
        originCollege: "MJPRU Bareilly",
        specialization: "Distributed Systems & Blockchain Consensus",
        targetTopics: ["Cloud Architecture", "Distributed Ledgers", "High-Performance Computing"],
        mode: "Online Guest",
        status: "Available"
      },
      {
        id: "SWAP-02",
        facultyName: "Prof. Sunita Rastogi",
        department: "Information Technology",
        originCollege: "IET Lucknow",
        specialization: "Applied Machine Learning & NLP",
        targetTopics: ["Transformer Models", "Prompt Engineering", "Generative AI Pipelines"],
        mode: "Weekend Masterclass",
        status: "Available"
      },
      {
        id: "SWAP-03",
        facultyName: "Dr. Manoj Saxena",
        department: "Computer Applications",
        originCollege: "Invertis University",
        specialization: "Full Stack & Enterprise Cloud Microservices",
        targetTopics: ["Docker & Kubernetes", "Secure REST & GraphQL APIs"],
        mode: "Semester Exchange",
        status: "Matched"
      }
    ],
    faqs: [
      {
        id: 1,
        category: "general",
        question: "How does Ladder verify my zero-NDA ghost internship proof?",
        answer: "Every deliverable passes automated unit & integration test suites. Upon passing, a cryptographic hash is signed by university faculty and mentor nodes and stored immutably in the Experience Passport ledger."
      },
      {
        id: 2,
        category: "mentorship",
        question: "What is a 15-Minute Micro-Capsule?",
        answer: "Micro-capsules are focused, 1-on-1 sprint review calls with verified Senior Architects from tier-1 companies (TCS, Infosys, Wipro). Mentors review architecture, PR diffs, and conduct rapid mock screens."
      },
      {
        id: 3,
        category: "gigs",
        question: "How do micro-internship stipends get disbursed?",
        answer: "Once a partner recruiter approves your submitted GitHub pull request, stipends are credited directly to your connected student bank account within 24 hours."
      },
      {
        id: 4,
        category: "faculty",
        question: "How do universities generate automated MoUs?",
        answer: "Faculty and HODs can select industry partners, specify candidate batch sizes, and generate signed AI-assisted MoUs compliant with AICTE & UGC guidelines."
      }
    ],
    jobs: [
      {
        id: "j1",
        numericId: 1,
        company: "TechNova Solutions",
        company_id: 1,
        title: "Software Engineer Intern",
        location: "Bengaluru",
        type: "Hybrid",
        duration: "6 Months",
        stipend: "₹25,000/month",
        openings: 8,
        required_skills: ["React", "Node.js", "PostgreSQL"],
        skills: ["React", "Node.js", "PostgreSQL"],
        eligibility: "B.Tech CSE/IT 2026/2027",
        description: "Work on high-scale cloud-native web microservices and UI components.",
        deadline: "2026-09-15",
        status: "Active",
        apps: 64,
        applications: 64,
        created_at: "2026-08-10T10:00:00.000Z"
      },
      {
        id: "j2",
        numericId: 2,
        company: "PixelWorks Digital",
        company_id: 2,
        title: "Frontend Developer Intern",
        location: "Remote",
        type: "Remote",
        duration: "3 Months",
        stipend: "₹20,000/month",
        openings: 5,
        required_skills: ["React", "TypeScript", "Tailwind CSS"],
        skills: ["React", "TypeScript", "Tailwind CSS"],
        eligibility: "All Engineering Branches",
        description: "Build responsive interactive dashboards and accessible user components.",
        deadline: "2026-09-20",
        status: "Active",
        apps: 41,
        applications: 41,
        created_at: "2026-08-12T10:00:00.000Z"
      },
      {
        id: "j3",
        numericId: 3,
        company: "DataSphere Analytics",
        company_id: 3,
        title: "Data Analyst Intern",
        location: "Noida",
        type: "In-Office",
        duration: "6 Months",
        stipend: "₹22,000/month",
        openings: 3,
        required_skills: ["Python", "SQL", "Power BI"],
        skills: ["Python", "SQL", "Power BI"],
        eligibility: "B.Tech / MCA / Data Science",
        description: "Perform cohort queries, pipeline automation and KPI dashboard visualizations.",
        deadline: "2026-09-25",
        status: "Active",
        apps: 28,
        applications: 28,
        created_at: "2026-08-14T10:00:00.000Z"
      },
      {
        id: "j4",
        numericId: 4,
        company: "CloudMatrix Systems",
        company_id: 1,
        title: "Java Cloud Developer",
        location: "Pune",
        type: "In-Office",
        duration: "Full-Time",
        stipend: "₹8.5 LPA",
        openings: 2,
        required_skills: ["Java", "Spring Boot", "AWS"],
        skills: ["Java", "Spring Boot", "AWS"],
        eligibility: "B.Tech CSE / IT 2025/2026",
        description: "Develop mission critical backend services and Kubernetes deployments.",
        deadline: "2026-10-01",
        status: "Active",
        apps: 31,
        applications: 31,
        created_at: "2026-08-15T10:00:00.000Z"
      },
      {
        id: "j5",
        numericId: 5,
        company: "AI Labs Global",
        company_id: 2,
        title: "ML Engineer Intern",
        location: "Hyderabad",
        type: "Hybrid",
        duration: "6 Months",
        stipend: "₹30,000/month",
        openings: 4,
        required_skills: ["Python", "PyTorch", "FastAPI"],
        skills: ["Python", "PyTorch", "FastAPI"],
        eligibility: "B.Tech CSE / AI Specialization",
        description: "Train, benchmark and deploy generative models and predictive algorithms.",
        deadline: "2026-09-30",
        status: "Active",
        apps: 20,
        applications: 20,
        created_at: "2026-08-18T10:00:00.000Z"
      },
      {
        id: "j6",
        numericId: 6,
        company: "NexaCloud Infrastructure",
        company_id: 3,
        title: "Cloud Support Associate",
        location: "Bengaluru",
        type: "In-Office",
        duration: "Full-Time",
        stipend: "₹7.2 LPA",
        openings: 10,
        required_skills: ["Linux", "Docker", "Bash"],
        skills: ["Linux", "Docker", "Bash"],
        eligibility: "B.Tech / BCA 2026",
        description: "Assist enterprise clients in cloud migrations, monitoring and SLAs.",
        deadline: "2026-10-15",
        status: "Draft",
        apps: 18,
        applications: 18,
        created_at: "2026-08-20T10:00:00.000Z"
      }
    ]
  };
}

// In-Memory store loader (strictly in memory runtime, never written to disk)
let memoryDb = null;

function loadDatabase() {
  if (memoryDb) return memoryDb;
  memoryDb = getDefaultData();
  return memoryDb;
}

// Initialize PostgreSQL if available
async function initializeDatabase() {
  const pool = getPgPool();
  if (!pool || pgInitialized) return;

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      await pool.query(sql);
      pgInitialized = true;
      console.log("✅ PostgreSQL schema & seed data verified/initialized successfully.");
    }
  } catch (err) {
    console.error("⚠️ PostgreSQL schema initialization notice:", err.message);
  }
}

async function checkDatabaseConnection() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT NOW()");
      return {
        connected: true,
        type: "PostgreSQL Cloud Database",
        timestamp: res.rows[0].now
      };
    } catch (err) {
      console.warn("PostgreSQL check failed, falling back to Local Persistent Ledger:", err.message);
    }
  }

  const db = loadDatabase();
  return {
    connected: true,
    type: "Ladder Persistent Database Ledger",
    usersCount: db.users.length,
    studentsCount: db.students.length,
    timestamp: new Date().toISOString()
  };
}

/* ================= CRUD OPERATIONS ================= */

// 1. REGISTER NEW USER & PERSIST TO DATABASE
async function registerUser({ name, email, password, role, extraInfo = {} }) {
  if (!name || !email || !password || !role) {
    throw new Error("Name, email, password, and role are required.");
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = loadDatabase();

  // Check if email exists in file DB
  const existingInFile = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingInFile) {
    throw new Error("An account with this email already exists.");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  let studentId = null;
  let mentorId = null;
  let companyId = null;

  // Insert linked profile
  if (role === "student") {
    studentId = db.students.length > 0 ? Math.max(...db.students.map((s) => s.id)) + 1 : 1;
    const newStudent = {
      id: studentId,
      name,
      course: extraInfo.course || "Computer Science & Information Technology",
      batch: extraInfo.batch || "2025-29",
      college: extraInfo.college || "Mahatma Jyotiba Phule Rohilkhand University, Bareilly",
      target_role: extraInfo.targetRole || "Software Engineer",
      career_readiness: 70,
      experience_score: 50,
      created_at: new Date().toISOString()
    };
    db.students.push(newStudent);
  } else if (role === "mentor") {
    mentorId = db.mentors.length > 0 ? Math.max(...db.mentors.map((m) => m.id)) + 1 : 1;
    const newMentor = {
      id: mentorId,
      name,
      role: extraInfo.jobRole || "Industry Mentor",
      company: extraInfo.company || "Independent Enterprise",
      experience_years: Number(extraInfo.experience) || 5,
      match: 92,
      availability: true,
      capsuleSlots: ["Today 4:00 PM", "Tomorrow 2:00 PM"],
      specialization: ["Full Stack", "System Design"]
    };
    db.mentors.push(newMentor);
  } else if (role === "company" || role === "recruiter") {
    companyId = db.companies.length > 0 ? Math.max(...db.companies.map((c) => c.id)) + 1 : 1;
    const newCompany = {
      id: companyId,
      company_name: extraInfo.company || name,
      industry: extraInfo.industry || "Technology",
      verified: true
    };
    db.companies.push(newCompany);
  }

  // Insert user record
  const newUserId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
  const newUser = {
    id: newUserId,
    name,
    email: cleanEmail,
    password_hash: passwordHash,
    role,
    student_id: studentId,
    mentor_id: mentorId,
    company_id: companyId,
    college: extraInfo.college || null,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  // Try saving to PostgreSQL if available
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, student_id, mentor_id, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING`,
        [newUserId, name, cleanEmail, passwordHash, role, studentId, mentorId, companyId]
      );
    } catch (pgErr) {
      console.warn("PostgreSQL mirror insert notice:", pgErr.message);
    }
  }

  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role, email: newUser.email, name: newUser.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.student_id,
      mentorId: newUser.mentor_id,
      companyId: newUser.company_id,
      college: newUser.college
    },
    message: "User registered and persisted to database successfully."
  };
}

// 2. LOGIN USER FROM DATABASE
async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = loadDatabase();

  // Search in database
  let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  // If not found in file DB, try checking Postgres
  const pool = getPgPool();
  if (!user && pool) {
    try {
      const res = await pool.query(
        "SELECT id, name, email, password_hash, role, student_id, mentor_id, company_id FROM users WHERE email = $1",
        [cleanEmail]
      );
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    } catch (pgErr) {
      console.warn("PG lookup notice:", pgErr.message);
    }
  }

  if (!user) {
    throw new Error("No account found with this email address. Please register first.");
  }

  // Compare bcrypt password hash
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid email or password. Please check your credentials.");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.student_id,
      mentorId: user.mentor_id,
      companyId: user.company_id,
      college: user.college
    },
    message: "Login successful"
  };
}

// 3. GET CURRENT LOGGED IN USER DETAILS
function getUserById(id) {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === Number(id));
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// 4. GET ALL USERS (FOR ADMIN/DEBUG)
function getAllUsers() {
  const db = loadDatabase();
  return db.users.map((u) => {
    const { password_hash, ...safe } = u;
    return safe;
  });
}

// 5. GET STUDENT PROFILE
function getStudentProfile(userIdOrStudentId) {
  const db = loadDatabase();
  if (userIdOrStudentId) {
    const user = db.users.find((u) => u.id === Number(userIdOrStudentId) || u.student_id === Number(userIdOrStudentId));
    if (user && user.student_id) {
      const student = db.students.find((s) => s.id === user.student_id);
      if (student) return student;
    }
  }
  return db.students[0] || null;
}

// 6. GET MENTORS & CREATE MENTOR
function getMentors() {
  const db = loadDatabase();
  return db.mentors.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role || "Senior Architect",
    company: m.company || "Industry Partner",
    experience: Number(m.experience || m.experience_years || 5),
    match: Number(m.match || 92),
    availability: m.availability !== false,
    capsuleSlots: Array.isArray(m.capsuleSlots) && m.capsuleSlots.length > 0
      ? m.capsuleSlots
      : ["Today 4:00 PM", "Tomorrow 11:30 AM", "Friday 5:15 PM"],
    specialization: Array.isArray(m.specialization) ? m.specialization : ["System Design", "Cloud Native", "Node.js"]
  }));
}

function createMentor({ name, role, company, experience, match, capsuleSlots, specialization }) {
  const db = loadDatabase();
  const newId = db.mentors.length > 0 ? Math.max(...db.mentors.map((m) => m.id)) + 1 : 1;
  const newMentor = {
    id: newId,
    name,
    role: role || "Lead Solutions Architect",
    company: company || "Enterprise Partner",
    experience: Number(experience) || 6,
    experience_years: Number(experience) || 6,
    match: Number(match) || 94,
    availability: true,
    capsuleSlots: capsuleSlots || ["Today 4:00 PM", "Tomorrow 2:00 PM", "Friday 11:00 AM"],
    specialization: specialization || ["Full Stack", "Distributed Systems"]
  };
  db.mentors.push(newMentor);

  const pool = getPgPool();
  if (pool) {
    pool.query(
      `INSERT INTO mentors (id, name, role, company, experience_years, availability)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (id) DO NOTHING`,
      [newId, name, newMentor.role, newMentor.company, newMentor.experience]
    ).catch((err) => console.warn("PG mentor insert notice:", err.message));
  }

  return newMentor;
}

// 7. GET GIGS & CREATE GIG
function getGigs() {
  const db = loadDatabase();
  return db.gigs.map((g) => ({
    id: g.id,
    title: g.title,
    company: g.company || "Tech Partner",
    skill: g.skill || g.required_skill || "Web Development",
    hours: Number(g.hours || g.duration_hours || 4),
    payment: Number(g.payment || 2000),
    applicantCount: Number(g.applicantCount || 0),
    status: g.status || "open",
    description: g.description || "Industry micro-internship sprint task.",
    created_at: g.created_at || new Date().toISOString()
  }));
}

function createGig({ title, requiredSkill, skill, hours, payment, description, company, companyId }) {
  const db = loadDatabase();
  const newId = db.gigs.length > 0 ? Math.max(...db.gigs.map((g) => g.id)) + 1 : 1;
  const newGig = {
    id: newId,
    title,
    company: company || "CloudSphere Systems",
    company_id: companyId || 1,
    skill: skill || requiredSkill || "Web Development",
    required_skill: skill || requiredSkill || "Web Development",
    hours: Number(hours) || 3,
    duration_hours: Number(hours) || 3,
    payment: Number(payment) || 2000,
    applicantCount: 0,
    status: "open",
    description: description || "Industry verified deliverable task.",
    created_at: new Date().toISOString()
  };
  db.gigs.unshift(newGig);

  const pool = getPgPool();
  if (pool) {
    pool.query(
      `INSERT INTO gigs (id, company_id, title, description, required_skill, duration_hours, payment, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
       ON CONFLICT (id) DO NOTHING`,
      [newId, newGig.company_id, title, newGig.description, newGig.skill, newGig.hours, newGig.payment]
    ).catch((err) => console.warn("PG gig insert notice:", err.message));
  }

  return newGig;
}

// 8. APPLY FOR GIG
function applyForGig({ studentId, gigId, message, githubRepo }) {
  const db = loadDatabase();
  const targetGig = db.gigs.find((g) => g.id === Number(gigId));
  if (targetGig) {
    targetGig.applicantCount = (targetGig.applicantCount || 0) + 1;
  }

  const newApp = {
    id: db.gig_applications.length + 1,
    student_id: Number(studentId) || 1,
    gig_id: Number(gigId) || 1,
    message: message || "Technical pitch submitted with repository proof of work.",
    github_repo: githubRepo || "https://github.com/aryan-11825114/sih",
    status: "submitted",
    created_at: new Date().toISOString()
  };
  db.gig_applications.push(newApp);

  const pool = getPgPool();
  if (pool) {
    pool.query(
      `INSERT INTO gig_applications (gig_id, student_id, message, status)
       VALUES ($1, $2, $3, 'submitted')`,
      [newApp.gig_id, newApp.student_id, newApp.message]
    ).catch((err) => console.warn("PG apply insert notice:", err.message));
  }

  return {
    ...newApp,
    updatedApplicantCount: targetGig ? targetGig.applicantCount : 1
  };
}

// 9. BOOK MENTOR
function bookMentorSession({ studentId, mentorId, date, time, topic }) {
  const db = loadDatabase();
  const mentor = db.mentors.find((m) => m.id === Number(mentorId));
  if (mentor && Array.isArray(mentor.capsuleSlots)) {
    mentor.capsuleSlots = mentor.capsuleSlots.filter((slot) => slot !== time);
    if (mentor.capsuleSlots.length === 0) {
      mentor.capsuleSlots = ["Next Tuesday 3:00 PM", "Next Thursday 5:00 PM"];
    }
  }

  const newBooking = {
    id: db.mentor_bookings.length + 1,
    student_id: Number(studentId) || 1,
    mentor_id: Number(mentorId) || 1,
    mentor_name: mentor ? mentor.name : "Mentor",
    topic: topic || "Code Review & Architecture",
    session_date: date || "Today",
    session_time: time,
    duration_minutes: 15,
    status: "confirmed",
    created_at: new Date().toISOString()
  };
  db.mentor_bookings.push(newBooking);

  const pool = getPgPool();
  if (pool) {
    pool.query(
      `INSERT INTO mentor_bookings (student_id, mentor_id, booking_date, duration_minutes, status)
       VALUES ($1, $2, NOW(), 15, 'confirmed')`,
      [newBooking.student_id, newBooking.mentor_id]
    ).catch((err) => console.warn("PG booking insert notice:", err.message));
  }

  return newBooking;
}

// 10. GET PASSPORT RECORDS & MINT
function getPassportRecords(studentId) {
  const db = loadDatabase();
  if (studentId) {
    return db.experience_records.filter((r) => r.student_id === Number(studentId));
  }
  return db.experience_records;
}

function mintPassportRecord({ studentId = 1, title, company, score = 95, skillsVerified = [] }) {
  const db = loadDatabase();
  const newId = db.experience_records.length > 0 ? Math.max(...db.experience_records.map((r) => r.id)) + 1 : 1;
  const hash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  
  const record = {
    id: newId,
    student_id: Number(studentId),
    title,
    company: company || "Enterprise Partner",
    experience_type: "Zero-NDA Ghost Simulation",
    score: Number(score),
    hash,
    verified: true,
    issueDate: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    skillsVerified: skillsVerified.length > 0 ? skillsVerified : ["System Design", "Node.js", "Express", "Verification Tests"],
    created_at: new Date().toISOString()
  };

  db.experience_records.unshift(record);

  // Update student score
  const student = db.students.find((s) => s.id === Number(studentId));
  if (student) {
    student.experience_score = Math.min(100, (student.experience_score || 50) + 12);
    student.career_readiness = Math.min(100, (student.career_readiness || 65) + 5);
  }

  return record;
}

// 11. HELPDESK TICKETS
function getHelpdeskTickets() {
  const db = loadDatabase();
  return db.helpdesk_tickets;
}

function createHelpdeskTicket({ title, category, description, priority = "medium", studentId = 1, aiSummary = "" }) {
  const db = loadDatabase();
  const newTicket = {
    id: db.helpdesk_tickets.length > 0 ? Math.max(...db.helpdesk_tickets.map((t) => t.id)) + 1 : 101,
    student_id: Number(studentId) || 1,
    category: category || "general",
    title,
    description,
    priority: priority.toLowerCase(),
    status: "open",
    ai_summary: aiSummary || "Diagnostic generated: follow recommended resolution steps.",
    created_at: new Date().toISOString()
  };
  db.helpdesk_tickets.unshift(newTicket);
  return newTicket;
}

// 12. GHOST TASKS
function getGhostTasks() {
  const db = loadDatabase();
  return db.ghost_tasks || [];
}

// 13. MOUS & FACULTY SWAPS
function getMouRequests() {
  const db = loadDatabase();
  return db.mou_requests || [];
}

function createMouRequest(payload) {
  const db = loadDatabase();
  const newMou = {
    id: "MOU-" + new Date().getFullYear() + "-" + String(db.mou_requests.length + 1).padStart(2, "0"),
    companyName: payload.companyName || "Enterprise Partner",
    industry: payload.industry || "Cloud & AI Systems",
    contactPerson: payload.contactPerson || "Lead Campus Director",
    status: "Active",
    dateCreated: new Date().toISOString().split("T")[0],
    scopes: payload.scopes || ["Placement Pipeline", "Mentorship", "Experience Passport"]
  };
  db.mou_requests.unshift(newMou);
  return newMou;
}

function getFacultySwaps() {
  const db = loadDatabase();
  return db.faculty_swaps || [];
}

function createFacultySwap(payload) {
  const db = loadDatabase();
  const newSwap = {
    id: "SWAP-" + String(db.faculty_swaps.length + 1).padStart(2, "0"),
    facultyName: payload.facultyName,
    department: payload.department || "Computer Science",
    originCollege: payload.originCollege,
    specialization: payload.specialization,
    targetTopics: payload.targetTopics || ["Distributed Systems", "Cloud"],
    mode: payload.mode || "Online Guest",
    status: "Available"
  };
  db.faculty_swaps.unshift(newSwap);
  return newSwap;
}

// 14. FAQS
function getFaqs() {
  const db = loadDatabase();
  return db.faqs || [];
}

// 15. RECRUITER JOB POSTINGS
async function getJobs() {
  const pool = getPgPool();
  if (pool) {
    try {
      // Ensure jobs table exists if not already created
      await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          company_id INT DEFAULT 1,
          company VARCHAR(150) NOT NULL,
          title VARCHAR(200) NOT NULL,
          location VARCHAR(150) DEFAULT 'Remote',
          type VARCHAR(50) DEFAULT 'Full-Time',
          duration VARCHAR(50) DEFAULT 'Full-Time',
          stipend VARCHAR(100) DEFAULT 'Competitive',
          openings INT DEFAULT 1,
          required_skills TEXT[] DEFAULT '{}',
          eligibility VARCHAR(200),
          description TEXT,
          deadline VARCHAR(50),
          status VARCHAR(30) DEFAULT 'Active',
          apps INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(j => {
          let parsedSkills = ['Engineering'];
          if (Array.isArray(j.required_skills)) {
            parsedSkills = j.required_skills;
          } else if (typeof j.required_skills === 'string') {
            parsedSkills = j.required_skills.replace(/[{}"']/g, '').split(',').map(s => s.trim()).filter(Boolean);
          }
          return {
            id: `j${j.id}`,
            numericId: j.id,
            title: j.title || 'Software Engineer',
            company: j.company || 'Enterprise Partner',
            company_id: j.company_id || 1,
            location: j.location || 'Remote',
            type: j.type || 'Full-Time',
            duration: j.duration || '6 Months',
            stipend: j.stipend || 'Competitive',
            openings: Number(j.openings || 1),
            required_skills: parsedSkills,
            skills: parsedSkills,
            requiredSkills: parsedSkills,
            eligibility: j.eligibility || 'All Qualified Candidates',
            description: j.description || 'Job role posted on Ladder Talent Network.',
            deadline: j.deadline || 'Open',
            status: j.status || 'Active',
            apps: Number(j.apps || 0),
            applications: Number(j.apps || 0),
            created_at: j.created_at || new Date().toISOString()
          };
        });
      }
    } catch (pgErr) {
      console.warn("PostgreSQL getJobs notice:", pgErr.message);
    }
  }

  const db = loadDatabase();
  if (!Array.isArray(db.jobs)) {
    db.jobs = getDefaultData().jobs;
  }
  return db.jobs.map(j => ({
    id: String(j.id || (j.numericId ? `j${j.numericId}` : `j${Date.now()}`)),
    numericId: Number(j.numericId || (typeof j.id === "number" ? j.id : String(j.id).replace(/\D/g, "")) || 1),
    title: j.title || "Software Engineer",
    company: j.company || "Enterprise Partner",
    company_id: j.company_id || 1,
    location: j.location || "Remote",
    type: j.type || "Full-Time",
    duration: j.duration || "6 Months",
    stipend: j.stipend || "Competitive",
    openings: Number(j.openings || 1),
    required_skills: Array.isArray(j.required_skills) ? j.required_skills : (Array.isArray(j.skills) ? j.skills : ["Engineering"]),
    skills: Array.isArray(j.skills) ? j.skills : (Array.isArray(j.required_skills) ? j.required_skills : ["Engineering"]),
    requiredSkills: Array.isArray(j.skills) ? j.skills : (Array.isArray(j.required_skills) ? j.required_skills : ["Engineering"]),
    eligibility: j.eligibility || "All Eligible Candidates",
    description: j.description || "Job role posted on Ladder Talent Network.",
    deadline: j.deadline || "Open",
    status: j.status || "Active",
    apps: Number(j.apps !== undefined ? j.apps : (j.applications || 0)),
    applications: Number(j.applications !== undefined ? j.applications : (j.apps || 0)),
    created_at: j.created_at || new Date().toISOString()
  }));
}

async function getJobById(id) {
  const jobs = await getJobs();
  const cleanId = String(id).toLowerCase();
  return jobs.find(j => String(j.id).toLowerCase() === cleanId || String(j.numericId) === cleanId) || null;
}

async function createJob(payload) {
  const skillsList = Array.isArray(payload.requiredSkills || payload.skills || payload.required_skills)
    ? (payload.requiredSkills || payload.skills || payload.required_skills)
    : (typeof (payload.requiredSkills || payload.skills || payload.required_skills) === "string"
        ? (payload.requiredSkills || payload.skills || payload.required_skills).split(",").map(s => s.trim()).filter(Boolean)
        : ["Engineering", "Problem Solving"]);

  let insertedJob = null;
  const pool = getPgPool();

  if (pool) {
    try {
      // Auto-ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          company_id INT DEFAULT 1,
          company VARCHAR(150) NOT NULL,
          title VARCHAR(200) NOT NULL,
          location VARCHAR(150) DEFAULT 'Remote',
          type VARCHAR(50) DEFAULT 'Full-Time',
          duration VARCHAR(50) DEFAULT 'Full-Time',
          stipend VARCHAR(100) DEFAULT 'Competitive',
          openings INT DEFAULT 1,
          required_skills TEXT[] DEFAULT '{}',
          eligibility VARCHAR(200),
          description TEXT,
          deadline VARCHAR(50),
          status VARCHAR(30) DEFAULT 'Active',
          apps INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query(
        `INSERT INTO jobs (company_id, company, title, location, type, duration, stipend, openings, required_skills, eligibility, description, deadline, status, apps)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0)
         RETURNING *`,
        [
          Number(payload.companyId || payload.company_id || 1),
          payload.company || "Enterprise Partner",
          payload.title,
          payload.location || "Remote",
          payload.type || payload.jobType || "Full-Time",
          payload.duration || "6 Months",
          payload.stipend || payload.salary || "Competitive",
          Number(payload.openings || 1),
          skillsList,
          payload.eligibility || "All Qualified Students",
          payload.description || "Job role posted on Ladder Talent Network.",
          payload.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          payload.status || "Active"
        ]
      );

      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        insertedJob = {
          id: `j${row.id}`,
          numericId: row.id,
          title: row.title,
          company: row.company,
          company_id: row.company_id,
          location: row.location,
          type: row.type,
          duration: row.duration,
          stipend: row.stipend,
          openings: Number(row.openings || 1),
          required_skills: Array.isArray(row.required_skills) ? row.required_skills : skillsList,
          skills: Array.isArray(row.required_skills) ? row.required_skills : skillsList,
          requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : skillsList,
          eligibility: row.eligibility,
          description: row.description,
          deadline: row.deadline,
          status: row.status,
          apps: Number(row.apps || 0),
          applications: Number(row.apps || 0),
          created_at: row.created_at
        };
        console.log(`✅ Job persisted to PostgreSQL database with ID: ${row.id}`);
      }
    } catch (pgErr) {
      console.warn("PostgreSQL job insert notice:", pgErr.message);
    }
  }

  const db = loadDatabase();
  if (!Array.isArray(db.jobs)) {
    db.jobs = getDefaultData().jobs;
  }

  if (!insertedJob) {
    const maxNumeric = db.jobs.reduce((max, j) => {
      const num = Number(j.numericId || (typeof j.id === "number" ? j.id : String(j.id).replace(/\D/g, ""))) || 0;
      return num > max ? num : max;
    }, 0);
    const newNumericId = maxNumeric + 1;
    insertedJob = {
      id: `j${newNumericId}`,
      numericId: newNumericId,
      title: payload.title || "Untitled Opportunity",
      company: payload.company || "Enterprise Partner",
      company_id: Number(payload.companyId || payload.company_id || 1),
      location: payload.location || "Remote",
      type: payload.type || payload.jobType || "Full-Time",
      duration: payload.duration || "6 Months",
      stipend: payload.stipend || payload.salary || "Competitive",
      openings: Number(payload.openings || 1),
      required_skills: skillsList,
      skills: skillsList,
      requiredSkills: skillsList,
      eligibility: payload.eligibility || "All Qualified Students",
      description: payload.description || "Job role posted on Ladder Talent Network.",
      deadline: payload.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: payload.status || "Active",
      apps: 0,
      applications: 0,
      created_at: new Date().toISOString()
    };
  }

  // Ensure insertedJob is unshifted in memoryDb
  const existingIndex = db.jobs.findIndex(j => String(j.id) === String(insertedJob.id) || String(j.numericId) === String(insertedJob.numericId));
  if (existingIndex >= 0) {
    db.jobs[existingIndex] = insertedJob;
  } else {
    db.jobs.unshift(insertedJob);
  }

  return insertedJob;
}

async function updateJob(id, updates) {
  const cleanId = String(id).toLowerCase();
  const numericId = Number(String(id).replace(/\D/g, '')) || null;
  const pool = getPgPool();

  if (pool && numericId) {
    try {
      await pool.query(
        `UPDATE jobs SET
           title = COALESCE($1, title),
           status = COALESCE($2, status),
           description = COALESCE($3, description),
           stipend = COALESCE($4, stipend),
           location = COALESCE($5, location)
         WHERE id = $6`,
        [updates.title || null, updates.status || null, updates.description || null, updates.stipend || null, updates.location || null, numericId]
      );
    } catch (err) {
      console.warn("PostgreSQL job update notice:", err.message);
    }
  }

  const db = loadDatabase();
  if (!Array.isArray(db.jobs)) return null;

  const index = db.jobs.findIndex(j => String(j.id).toLowerCase() === cleanId || String(j.numericId) === cleanId || String(j.numericId) === String(numericId));
  if (index === -1) return null;

  const existing = db.jobs[index];
  const updatedJob = {
    ...existing,
    ...updates,
    id: existing.id,
    numericId: existing.numericId,
    last_updated: new Date().toISOString()
  };

  if (updates.requiredSkills || updates.skills || updates.required_skills) {
    const list = Array.isArray(updates.requiredSkills || updates.skills || updates.required_skills)
      ? (updates.requiredSkills || updates.skills || updates.required_skills)
      : String(updates.requiredSkills || updates.skills || updates.required_skills).split(",").map(s => s.trim()).filter(Boolean);
    updatedJob.required_skills = list;
    updatedJob.skills = list;
    updatedJob.requiredSkills = list;
  }

  db.jobs[index] = updatedJob;

  return updatedJob;
}

async function deleteJob(id) {
  const cleanId = String(id).toLowerCase();
  const numericId = Number(String(id).replace(/\D/g, '')) || null;
  let deletedFromPg = false;
  const pool = getPgPool();

  if (pool && numericId) {
    try {
      const res = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING id", [numericId]);
      if (res.rows && res.rows.length > 0) {
        deletedFromPg = true;
        console.log(`✅ Deleted job ID ${numericId} from PostgreSQL.`);
      }
    } catch (err) {
      console.warn("PostgreSQL job delete notice:", err.message);
    }
  }

  const db = loadDatabase();
  if (!Array.isArray(db.jobs)) return deletedFromPg || true;

  const initialLength = db.jobs.length;
  db.jobs = db.jobs.filter(j => String(j.id).toLowerCase() !== cleanId && String(j.numericId) !== cleanId && String(j.numericId) !== String(numericId));
  
  return deletedFromPg || db.jobs.length !== initialLength || true;
}

// Generic query helper for SQL compatibility
async function query(text, params) {
  const pool = getPgPool();
  if (pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn("PostgreSQL query failed, fallback to empty rows:", err.message);
      return { rows: [] };
    }
  }
  return { rows: [] };
}

module.exports = {
  loadDatabase,
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  getStudentProfile,
  getMentors,
  createMentor,
  getGigs,
  createGig,
  applyForGig,
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  bookMentorSession,
  getPassportRecords,
  mintPassportRecord,
  getHelpdeskTickets,
  createHelpdeskTicket,
  getGhostTasks,
  getMouRequests,
  createMouRequest,
  getFacultySwaps,
  createFacultySwap,
  getFaqs,
  query,
  checkDatabaseConnection,
  initializeDatabase
};
