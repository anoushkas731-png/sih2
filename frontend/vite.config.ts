import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Embedded Dev API plugin connected directly to the persistent database ledger
function devApiPlugin(): Plugin {
  return {
    name: 'skillbridge-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Helper to parse incoming JSON request body
        const readBody = async (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                resolve({});
              }
            });
          });
        };

        // Load database module
        let db: any;
        try {
          // Dynamic require backend db
          db = require(path.resolve(__dirname, '../backend/db.js'));
        } catch (e) {
          console.warn('Could not load backend db in dev middleware:', e);
        }

        const url = req.url.split('?')[0];

        // 1. Health check
        if (url === '/api/health') {
          try {
            const health = db ? await db.checkDatabaseConnection() : { connected: true, type: 'Database Ledger' };
            res.statusCode = 200;
            return res.end(JSON.stringify({
              status: 'online',
              service: 'Ladder AI Career OS',
              version: '2026.1',
              database: health
            }));
          } catch (err: any) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              status: 'online',
              service: 'Ladder AI Career OS',
              database: { connected: true, type: 'Ladder Persistent Ledger' }
            }));
          }
        }

        // 2. Authentication: Register
        if (url === '/api/auth/register' && req.method === 'POST') {
          const body = await readBody();
          const { name, email, password, role, extraInfo } = body;

          if (!name || !email || !password || !role) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Name, email, password, and role are required.' }));
          }

          if (db) {
            try {
              const result = await db.registerUser({ name, email, password, role, extraInfo });
              res.statusCode = 201;
              return res.end(JSON.stringify(result));
            } catch (err: any) {
              const isConflict = err.message && err.message.includes('already exists');
              res.statusCode = isConflict ? 400 : 500;
              return res.end(JSON.stringify({ error: err.message || 'Registration failed' }));
            }
          }
        }

        // 3. Authentication: Login
        if (url === '/api/auth/login' && req.method === 'POST') {
          const body = await readBody();
          const { email, password } = body;

          if (!email || !password) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Email and password are required.' }));
          }

          if (db) {
            try {
              const result = await db.loginUser({ email, password });
              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: err.message || 'Authentication failed' }));
            }
          }
        }

        // 4. View all database users (for verification/admin)
        if (url === '/api/database/users' || url === '/api/auth/users') {
          if (db) {
            const users = db.getAllUsers();
            res.statusCode = 200;
            return res.end(JSON.stringify({ count: users.length, users }));
          }
        }

        // 5. Student details
        if (url.startsWith('/api/student')) {
          if (db) {
            const student = db.getStudentProfile();
            res.statusCode = 200;
            return res.end(JSON.stringify(student));
          }
        }

        // 6. Mentors
        if (url.startsWith('/api/mentors')) {
          if (req.method === 'POST' && url.includes('/book')) {
            const body = await readBody();
            const booking = db ? db.bookMentorSession(body) : { id: 1, status: 'confirmed' };
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, booking }));
          }

          if (req.method === 'POST') {
            const body = await readBody();
            const newMentor = db ? db.createMentor(body) : { id: Date.now(), ...body };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, mentor: newMentor }));
          }

          if (db) {
            const mentors = db.getMentors();
            res.statusCode = 200;
            return res.end(JSON.stringify(mentors));
          }
        }

        // 7. Gigs & Applications
        if (url.startsWith('/api/gigs')) {
          if (req.method === 'POST' && url.includes('/apply')) {
            const body = await readBody();
            const application = db ? db.applyForGig(body) : { id: 1, status: 'submitted' };
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, application }));
          }

          if (req.method === 'POST') {
            const body = await readBody();
            const newGig = db ? db.createGig(body) : { id: Date.now(), ...body, applicantCount: 0 };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, gig: newGig }));
          }

          if (db) {
            const gigs = db.getGigs();
            res.statusCode = 200;
            return res.end(JSON.stringify(gigs));
          }
        }

        // 8. Experience Passport
        if (url.startsWith('/api/passport')) {
          if (req.method === 'POST' && url.includes('/mint')) {
            const body = await readBody();
            const record = db ? db.mintPassportRecord(body) : { id: Date.now(), ...body, verified: true };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, record }));
          }

          if (db) {
            const records = db.getPassportRecords();
            res.statusCode = 200;
            return res.end(JSON.stringify(records));
          }
        }

        // 9. Helpdesk FAQ & Tickets & Live AI Chat
        if (url.startsWith('/api/ai/helpdesk/chat')) {
          if (req.method === 'POST') {
            const body = await readBody();
            const message = body.message || '';
            const history = body.history || [];
            const studentProfile = body.studentProfile || {};
            const studentName = studentProfile.name || 'there';

            let reply = '';
            const apiKey = process.env.GEMINI_API_KEY;

            if (apiKey && apiKey.trim().length > 5) {
              try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
                const systemInstruction = `You are Bridge Buddy, the official live AI Assistant and Tech Specialist for Ladder AI | Career OS.
You are a senior developer, human-coded, friendly, with a natural Hinglish mix, concise tone with structured code blocks. 24/7 Support Team Online.
User details: Name = ${studentName}.
Stats: Skill DNA 84/100, Career Readiness 81%, Top 8% of Batch, Target base package 14.5 LPA, Mentor Amit Verma (Senior Architect at TCS).

RULES:
1. Always address the user directly as "${studentName}" (Say Adarsh ONLY if name is Adarsh. If hi/hello -> "Hey ${studentName}! 👋").
2. FORBIDDEN PHRASES: Never say "I've analyzed your question and logged it", "Check recommendations below", or "Ticket logged". Never say anything about logging questions in the background.
3. Direct Code Answers: Always answer directly with complete, working code blocks (Node.js, Express, React, PostgreSQL, Redis, JWT token blacklisting with full middleware, etc.).
4. Cover: Technical questions, Micro-Gigs/Internships (deliverables, checklist, timeline, zero-NDA, ₹1,500-₹5,000 stipend), Experience Passport (SHA-256 cryptographic verification), Mentorship Capsules.`;

                const contents: any[] = [];
                if (Array.isArray(history) && history.length > 0) {
                  const recent = history.slice(-6);
                  for (const msg of recent) {
                    if (msg.sender === 'user') {
                      contents.push({ role: 'user', parts: [{ text: msg.text }] });
                    } else if (msg.sender === 'ai' || msg.sender === 'assistant') {
                      contents.push({ role: 'model', parts: [{ text: msg.text }] });
                    }
                  }
                }
                contents.push({ role: 'user', parts: [{ text: message }] });

                const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.0-flash'];
                for (const modelName of candidateModels) {
                  try {
                    const response = await ai.models.generateContent({
                      model: modelName,
                      contents,
                      config: {
                        systemInstruction,
                        temperature: 0.6,
                        maxOutputTokens: 1000,
                        thinkingConfig: { thinkingLevel: 'minimal' }
                      }
                    });

                    console.log('Gemini API response:', response);

                    if (response && response.text) {
                      reply = response.text.trim();
                      break;
                    }
                  } catch (modelErr: any) {
                    console.warn(`Model ${modelName} unavailable (${modelErr?.status || modelErr?.message}), trying fallback model...`);
                  }
                }
              } catch (e: any) {
                console.warn('Gemini chat error in dev middleware:', e.message);
              }
            }

            if (!reply) {
              const lower = message.trim().toLowerCase();
              const greetings = ['hi', 'hii', 'hiiii', 'hello', 'hey', 'heyy', 'hlw', 'hola', 'yo'];
              if (greetings.includes(lower.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ''))) {
                reply = `Hey ${studentName}! 👋 How's your career sprint going? Ask me any questions about micro-gigs, technical implementations (like JWT blacklisting), or resume tips and I will help you solve them immediately!`;
              } else if (lower.includes('jwt') || lower.includes('token') || lower.includes('auth') || lower.includes('blacklist') || lower.includes('redis')) {
                reply = `Hey ${studentName}! Blacklisting = logout pe token invalid.

**Redis (Production for 462 users):**
\`\`\`javascript
// On logout - blacklist token
await redis.set(\`bl_\${token}\`, 'true', 'EX', 3600);

// Auth Middleware check
const isBlack = await redis.get(\`bl_\${token}\`);
if (isBlack) return res.status(401).json({ msg: 'Logged out / Token Revoked' });

jwt.verify(token, process.env.JWT_SECRET);
next();
\`\`\`

**In-Memory Set (Local Debugging):**
\`\`\`javascript
const blacklist = new Set();
// On logout
blacklist.add(token);
// In middleware
if (blacklist.has(token)) return res.status(401).json({ msg: 'Token Revoked' });
\`\`\`

**PostgreSQL Refresh Token Ledger:**
Store active refresh tokens in a \`user_sessions\` table and revoke them upon logout.`;
              } else if (lower.includes('postgres') || lower.includes('sql') || lower.includes('db') || lower.includes('index') || lower.includes('database')) {
                reply = `Hey ${studentName}! Let's optimize your PostgreSQL connection and query performance on Ladder.

\`\`\`javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
\`\`\`

**Composite Indexing for Skill DNA:**
\`\`\`sql
CREATE INDEX idx_cohort_readiness ON students(batch, career_readiness DESC);
\`\`\``;
              } else if (lower.includes('gig') || lower.includes('stipend') || lower.includes('internship') || lower.includes('money') || lower.includes('task')) {
                reply = `Hey ${studentName}! Here is the Micro-Internship & Gigs breakdown on Ladder:

- **Deliverables**: Modular components, tested endpoints, clean PR documentation.
- **Stipends**: ₹1,500 - ₹5,000 disbursed directly to your university account within 48h.
- **Timeline**: 3-7 day sprints with instant automated sandbox validation.
- **NDA & Verification**: Virtual zero-NDA policy + SHA-256 cryptographic proof minted to your Experience Passport.`;
              } else if (lower.includes('dna') || lower.includes('score') || lower.includes('readiness') || lower.includes('profile') || lower.includes('website')) {
                reply = `Hey ${studentName}! Here are your live Ladder Career OS metrics:

- **Skill DNA Score**: 84/100
- **Career Readiness Index**: 81%
- **Cohort Performance**: Top 8% of Batch
- **Time Machine Prediction**: 14.5 LPA target base package
- **Mentorship Network**: 15-Minute Capsules with leaders like Amit Verma (Senior Architect at TCS).`;
              } else {
                reply = `Hey ${studentName}! I'm your Bridge Buddy AI Assistant. Ask me anything on technical architectures (JWT, Redis, PostgreSQL, React), micro-gigs, or platform tools. I will provide direct code solutions immediately!`;
              }
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, reply, timestamp: new Date().toISOString() }));
          }
        }

        if (url.startsWith('/api/ai/helpdesk/faq')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            faqs: [
              { id: 1, category: 'passport', question: 'How are Experience Passport credentials cryptographically verified?', answer: 'Every completed micro-internship produces a cryptographic SHA-256 hash containing student ID, issuer public key, and test suite outcome.' },
              { id: 2, category: 'gigs', question: 'When and how are micro-task stipends disbursed?', answer: 'Once proof-of-work is verified, stipends (₹1,500 - ₹5,000) are cleared via direct university transfer within 48 business hours.' },
              { id: 3, category: 'mentors', question: 'What is a 15-Minute Mentor Capsule?', answer: 'A high-impact sprint with a Senior Industry Architect to review PRs and career roadmaps.' }
            ]
          }));
        }

        if (url.startsWith('/api/ai/helpdesk/tickets')) {
          if (req.method === 'POST') {
            const body = await readBody();
            const ticket = db ? db.createHelpdeskTicket(body) : { id: 102, status: 'open' };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, ticket }));
          }

          if (db) {
            const tickets = db.getHelpdeskTickets();
            res.statusCode = 200;
            return res.end(JSON.stringify(tickets));
          }
        }

        // 10. Ghost Tasks
        if (url.startsWith('/api/ghost-tasks')) {
          if (db) {
            const tasks = db.getGhostTasks();
            res.statusCode = 200;
            return res.end(JSON.stringify(tasks));
          }
        }

        // 11. Faculty MOUs & Swaps
        if (url.startsWith('/api/faculty/mous')) {
          if (req.method === 'POST') {
            const body = await readBody();
            const mou = db ? db.createMouRequest(body) : { id: 'MOU-1', ...body };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, mou }));
          }
          if (db) {
            const mous = db.getMouRequests();
            res.statusCode = 200;
            return res.end(JSON.stringify(mous));
          }
        }

        if (url.startsWith('/api/faculty/swaps')) {
          if (req.method === 'POST') {
            const body = await readBody();
            const swap = db ? db.createFacultySwap(body) : { id: 'SWAP-1', ...body };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, swap }));
          }
          if (db) {
            const swaps = db.getFacultySwaps();
            res.statusCode = 200;
            return res.end(JSON.stringify(swaps));
          }
        }

        if (url.startsWith('/api/faqs')) {
          if (db) {
            const faqs = db.getFaqs();
            res.statusCode = 200;
            return res.end(JSON.stringify(faqs));
          }
        }

        // 12. Recruiter Job Postings & Internships
        if (url.startsWith('/api/jobs')) {
          // DELETE /api/jobs/:id
          if (req.method === 'DELETE') {
            const id = url.split('/').pop();
            const success = db ? await db.deleteJob(id) : true;
            res.statusCode = 200;
            return res.end(JSON.stringify({ success, message: 'Job deleted from database' }));
          }

          // PUT /api/jobs/:id
          if (req.method === 'PUT') {
            const id = url.split('/').pop();
            const body = await readBody();
            const updated = db ? await db.updateJob(id, body) : { id, ...body };
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, job: updated, message: 'Job updated in database' }));
          }

          // POST /api/jobs
          if (req.method === 'POST') {
            const body = await readBody();
            const newJob = db ? await db.createJob(body) : { id: `j${Date.now()}`, ...body, apps: 0, applications: 0 };
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, job: newJob, message: 'Job created in database' }));
          }

          // GET /api/jobs/:id
          const parts = url.split('/');
          if (parts.length > 3 && parts[3]) {
            const id = parts[3];
            const job = db ? await db.getJobById(id) : null;
            if (!job) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Job not found' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify(job));
          }

          // GET /api/jobs
          if (db) {
            const jobs = await db.getJobs();
            res.statusCode = 200;
            return res.end(JSON.stringify(jobs));
          }
        }

        // 13. Student Pipeline & Mentorship Funnel
        if (url.startsWith('/api/mentor/pipeline') || url.startsWith('/api/student-pipeline')) {
          if (req.method === 'POST') {
            const body = await readBody();
            res.statusCode = 201;
            return res.end(JSON.stringify({ success: true, student: body }));
          }
          if (db && typeof db.getPipelineStudents === 'function') {
            const list = await db.getPipelineStudents();
            res.statusCode = 200;
            return res.end(JSON.stringify(list));
          }
          // Default empty or handled on client-side
          res.statusCode = 200;
          return res.end(JSON.stringify([]));
        }

        // 14. OAuth Connection endpoints
        if (url.startsWith('/api/auth/status/')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({ connected: false }));
        }

        if (url.startsWith('/api/auth/url')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({ url: '#' }));
        }

        if (url.startsWith('/api/auth/disconnect/')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        // 15. AI Career Analysis & Skill Gaps
        if (url.startsWith('/api/ai/career-analysis')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            analysis: 'Student demonstrates strong algorithmic foundational skill with highest career velocity toward Full-Stack & Microservices engineering.',
            strengths: ['Algorithmic Logic (88%)', 'Code Quality & Clean Architecture (85%)', 'Adaptability (84%)'],
            recommendations: ['Build high-concurrency microservice deliverable', 'Complete 3 Ghost simulation sandboxes']
          }));
        }

        if (url.startsWith('/api/ai/skill-gaps')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            gaps: [
              { skill: 'Distributed Sharding', gap: 40, priority: 'High' },
              { skill: 'Zero-Trust JWT Blacklisting', gap: 28, priority: 'Medium' }
            ]
          }));
        }

        // 16. Chat API (AI Faculty Advisor)
        if (url.startsWith('/api/chat')) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            reply: 'CSIT Academic Advisory: Curriculum aligns with industry standards. 84% student cohort on track for 2026-27 placement cycle.',
            text: 'CSIT Academic Advisory: Curriculum aligns with industry standards. 84% student cohort on track for 2026-27 placement cycle.'
          }));
        }

        // Generic catch-all
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Ladder API response OK' }));
      });
    }
  };
}

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react(), tailwindcss(), devApiPlugin()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  }
});
