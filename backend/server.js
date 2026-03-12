const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');
const VIDEOS_FILE = path.join(__dirname, 'videos.json');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const PDFS_FILE = path.join(__dirname, 'pdfs.json');
const EXAMS_FILE = path.join(__dirname, 'exams.json');
const GRADES_FILE = path.join(__dirname, 'exam_grades.json');

// helper to read/write JSON files
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function loadVideos() {
  try {
    const data = fs.readFileSync(VIDEOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

function saveVideos(videos) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
}

function loadProgress() {
  try {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function savePdfs(pdfs) {
  fs.writeFileSync(PDFS_FILE, JSON.stringify(pdfs, null, 2));
}

function saveExams(exams) {
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
}

function loadGrades() {
  try {
    const data = fs.readFileSync(GRADES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function saveGrades(grades) {
  fs.writeFileSync(GRADES_FILE, JSON.stringify(grades, null, 2));
}

function loadPdfs() {
  try {
    const data = fs.readFileSync(PDFS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function loadExams() {
  try {
    const data = fs.readFileSync(EXAMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// bootstrap initial accounts (admin + teachers)
function initUsers() {
  let users = loadUsers();
  if (users.length === 0) {
    users = [
      { email: 'admin12345@gmail.com', password: bcrypt.hashSync('Admin@123', 10), role: 'admin' },
      { email: 'warda12345@gmail.com', password: bcrypt.hashSync('Teacher@123', 10), role: 'teacher' },
      { email: 'ahlam12345@gmail.com', password: bcrypt.hashSync('Teacher@123', 10), role: 'teacher' },
      { email: 'nourhan12345@gmail.com', password: bcrypt.hashSync('Teacher@123', 10), role: 'teacher' }
    ];
    saveUsers(users);
    console.log('Initial users created');
  }
  return users;
}

const app = express();

// Middleware to set CORS headers BEFORE any other processing
app.use((req, res, next) => {
  // Set CORS headers for all requests
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Respond to OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// load or initialize
let users = initUsers();

// Root endpoint - info about the API
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Acadmy Backend API',
    version: '1.0.0',
    endpoints: {
      auth: ['/login', '/register'],
      videos: ['/videos', '/videos/:id'],
      progress: ['/progress', '/progress/:studentEmail'],
      pdfs: ['/pdfs', '/pdfs/:id'],
      exams: ['/exams', '/exams/:id'],
      admin: ['/admin/users', '/admin/stats']
    }
  });
});

// Handle Chrome DevTools well-known endpoint (prevents 404 errors)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({ supported: true });
});

// Health check
app.get('/ping', (req, res) => {
  res.send('pong');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // anything that is not one of the preseeded teachers/admin is student
  const role = 'student';
  const hashed = bcrypt.hashSync(password, 10);
  const newUser = { email, password: hashed, role };
  users.push(newUser);
  saveUsers(users);
  res.json({ message: 'Registered successfully', role });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  res.json({ message: 'Logged in', role: user.role });
});

// ============ VIDEOS API ============

// GET all videos (with optional category filter)
app.get('/videos', (req, res) => {
  const category = req.query.category;
  const teacherEmail = req.query.teacher;
  
  let videos = loadVideos();
  
  if (category) {
    videos = videos.filter(v => v.category === category);
  }
  if (teacherEmail) {
    videos = videos.filter(v => v.teacher === teacherEmail);
  }
  
  res.json(videos);
});

// GET single video by id
app.get('/videos/:id', (req, res) => {
  const videos = loadVideos();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ message: 'فيديو غير موجود' });
  }
  
  res.json(video);
});

// POST create new video (teacher only)
app.post('/videos', (req, res) => {
  const { title, description, url, category, teacher } = req.body;
  
  if (!title || !url || !category || !teacher) {
    return res.status(400).json({ message: 'عنوان ورابط والتصنيف والمدرس مطلوبة' });
  }
  
  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  
  if (!user || user.role !== 'teacher') {
    return res.status(403).json({ message: 'فقط المدرسون يمكنهم إضافة فيديوهات' });
  }
  
  const videos = loadVideos();
  const newVideo = {
    id: Date.now().toString(),
    title,
    description: description || '',
    url,
    category: category || 'برمجة',
    teacher,
    createdAt: new Date().toISOString(),
    duration: 0 // can be updated later
  };
  
  videos.push(newVideo);
  saveVideos(videos);
  
  res.json({ message: 'تم إضافة الفيديو بنجاح', video: newVideo });
});

// DELETE video (teacher can delete own, admin can delete any)
app.delete('/videos/:id', (req, res) => {
  const { teacher } = req.body;
  
  if (!teacher) {
    return res.status(400).json({ message: 'البريد الإلكتروني للمدرس مطلوب' });
  }
  
  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'ليس لديك صلاحية' });
  }
  
  const videos = loadVideos();
  const videoIndex = videos.findIndex(v => v.id === req.params.id);
  
  if (videoIndex === -1) {
    return res.status(404).json({ message: 'فيديو غير موجود' });
  }
  
  // teacher can only delete own videos
  if (user.role === 'teacher' && videos[videoIndex].teacher !== teacher) {
    return res.status(403).json({ message: 'لا يمكنك حذف فيديو لمدرس آخر' });
  }
  
  videos.splice(videoIndex, 1);
  saveVideos(videos);
  
  res.json({ message: 'تم حذف الفيديو بنجاح' });
});

// PUT update video (teacher can update own, admin can update any)
app.put('/videos/:id', (req, res) => {
  const { title, description, url, category, teacher } = req.body;
  
  if (!teacher) {
    return res.status(400).json({ message: 'البريد الإلكتروني للمدرس مطلوب' });
  }
  
  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'ليس لديك صلاحية' });
  }
  
  const videos = loadVideos();
  const videoIndex = videos.findIndex(v => v.id === req.params.id);
  
  if (videoIndex === -1) {
    return res.status(404).json({ message: 'فيديو غير موجود' });
  }
  
  // teacher can only update own videos
  if (user.role === 'teacher' && videos[videoIndex].teacher !== teacher) {
    return res.status(403).json({ message: 'لا يمكنك تعديل فيديو لمدرس آخر' });
  }
  
  // update fields
  if (title !== undefined) videos[videoIndex].title = title;
  if (description !== undefined) videos[videoIndex].description = description;
  if (url !== undefined) videos[videoIndex].url = url;
  if (category !== undefined) videos[videoIndex].category = category;
  
  saveVideos(videos);
  
  res.json({ message: 'تم تحديث الفيديو بنجاح', video: videos[videoIndex] });
});

// ============ PROGRESS API ============

// GET student progress
app.get('/progress/:studentEmail', (req, res) => {
  const progress = loadProgress();
  const studentProgress = progress.filter(p => p.student === req.params.studentEmail);
  
  res.json(studentProgress);
});

// POST record video watch/completion
app.post('/progress', (req, res) => {
  const { student, videoId, status, progress: percent } = req.body;
  
  if (!student || !videoId) {
    return res.status(400).json({ message: 'البريد الإلكتروني والفيديو مطلوبان' });
  }
  
  const users = loadUsers();
  const user = users.find(u => u.email === student);
  
  if (!user || user.role !== 'student') {
    return res.status(403).json({ message: 'فقط الطلاب يمكنهم تسجيل التقدم' });
  }
  
  let progressList = loadProgress();
  const existingIndex = progressList.findIndex(p => p.student === student && p.videoId === videoId);
  
  const progressEntry = {
    student,
    videoId,
    status: status || 'watching', // watching, completed
    percent: percent || 0,
    lastUpdated: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    progressList[existingIndex] = progressEntry;
  } else {
    progressList.push(progressEntry);
  }
  
  saveProgress(progressList);
  
  res.json({ message: 'تم تحديث التقدم', progress: progressEntry });
});

// ============ DASHBOARD STATS ============

// GET all users (admin only)
app.get('/admin/users', (req, res) => {
  const adminEmail = req.query.admin;
  const users = loadUsers();
  
  const admin = users.find(u => u.email === adminEmail);
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ message: 'ليس لديك صلاحية' });
  }
  
  // return all users but without passwords
  const safeUsers = users.map(u => ({
    email: u.email,
    role: u.role
  }));
  
  res.json(safeUsers);
});

// GET stats (teacher/admin)
app.get('/admin/stats', (req, res) => {
  const email = req.query.email;
  const users = loadUsers();
  
  const user = users.find(u => u.email === email);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ message: 'ليس لديك صلاحية' });
  }
  
  const videos = loadVideos();
  const progress = loadProgress();
  
  let stats = {
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalVideos: videos.length,
    totalProgress: progress.length
  };
  
  // teacher can only see own stats
  if (user.role === 'teacher') {
    stats.myVideos = videos.filter(v => v.teacher === email).length;
  }
  
  res.json(stats);
});

// GET teachers (public for students to see)
app.get('/teachers', (req, res) => {
  const users = loadUsers();
  const teachers = users.filter(u => u.role === 'teacher').map(u => ({
    email: u.email,
    role: u.role
  }));
  res.json(teachers);
});

// ============ PDFS & EXAMS API ============

// GET all pdfs
app.get('/pdfs', (req, res) => {
  const pdfs = loadPdfs();
  res.json(pdfs);
});

// GET single pdf by id
app.get('/pdfs/:id', (req, res) => {
  const pdfs = loadPdfs();
  const pdf = pdfs.find(p => p.id === req.params.id);
  if (!pdf) return res.status(404).json({ message: 'PDF غير موجود' });
  res.json(pdf);
});

// GET all exams
app.get('/exams', (req, res) => {
  const exams = loadExams();
  res.json(exams);
});

// GET single exam by id
app.get('/exams/:id', (req, res) => {
  const exams = loadExams();
  const exam = exams.find(e => e.id === req.params.id);
  if (!exam) return res.status(404).json({ message: 'امتحان غير موجود' });
  res.json(exam);
});

// POST a grade for an exam (student submits or Apps Script posts result)
app.post('/exams/:id/grades', (req, res) => {
  const examId = req.params.id;
  const { student, score, maxScore } = req.body;
  if (!student || score === undefined) return res.status(400).json({ message: 'student and score required' });

  const exams = loadExams();
  const exam = exams.find(e => e.id === examId);
  if (!exam) return res.status(404).json({ message: 'امتحان غير موجود' });

  const { studentName } = req.body;
  const grades = loadGrades();
  const existing = grades.find(g => g.examId === examId && g.student === student);
  const now = new Date().toISOString();
  if (existing) {
    existing.score = score;
    existing.maxScore = maxScore || existing.maxScore || null;
    existing.updatedAt = now;
  } else {
    grades.push({ id: Date.now().toString(), examId, student, studentName: studentName || null, score, maxScore: maxScore || null, createdAt: now, updatedAt: now });
  }
  saveGrades(grades);
  res.json({ message: 'Grade recorded', grade: grades.find(g => g.examId === examId && g.student === student) });
});

// GET grades for an exam (list)
app.get('/exams/:id/grades', (req, res) => {
  const examId = req.params.id;
  const grades = loadGrades();
  res.json(grades.filter(g => g.examId === examId));
});

// GET grades by student
app.get('/grades', (req, res) => {
  const student = req.query.student;
  if (!student) return res.status(400).json({ message: 'student query required' });
  const grades = loadGrades();
  res.json(grades.filter(g => g.student === student));
});

// CREATE a new PDF (teacher only)
app.post('/pdfs', (req, res) => {
  const { title, url, teacher } = req.body;
  if (!title || !url || !teacher) return res.status(400).json({ message: 'title, url and teacher are required' });

  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return res.status(403).json({ message: 'ليس لديك صلاحية' });

  const pdfs = loadPdfs();
  const newPdf = { id: Date.now().toString(), title, description: '', url, teacher, createdAt: new Date().toISOString() };
  pdfs.push(newPdf);
  savePdfs(pdfs);
  res.json({ message: 'تم إضافة PDF', pdf: newPdf });
});

// DELETE a PDF (teacher can delete own, admin any)
app.delete('/pdfs/:id', (req, res) => {
  const { teacher } = req.body;
  if (!teacher) return res.status(400).json({ message: 'teacher email required in body' });

  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return res.status(403).json({ message: 'ليس لديك صلاحية' });

  const pdfs = loadPdfs();
  const idx = pdfs.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'PDF غير موجود' });
  if (user.role === 'teacher' && pdfs[idx].teacher !== teacher) return res.status(403).json({ message: 'لا يمكنك حذف PDF لمعلم آخر' });

  pdfs.splice(idx, 1);
  savePdfs(pdfs);
  res.json({ message: 'تم حذف PDF' });
});

// CREATE a new exam (teacher only)
app.post('/exams', (req, res) => {
  const { title, date, pdf, teacher } = req.body;
  if (!title || !date || !teacher) return res.status(400).json({ message: 'title, date and teacher are required' });

  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return res.status(403).json({ message: 'ليس لديك صلاحية' });

  const exams = loadExams();
  const newExam = { id: Date.now().toString(), title, description: '', pdf: pdf || null, date, teacher, createdAt: new Date().toISOString() };
  exams.push(newExam);
  saveExams(exams);
  res.json({ message: 'تم إضافة الامتحان', exam: newExam });
});

// DELETE an exam (teacher can delete own, admin any)
app.delete('/exams/:id', (req, res) => {
  const { teacher } = req.body;
  if (!teacher) return res.status(400).json({ message: 'teacher email required in body' });

  const users = loadUsers();
  const user = users.find(u => u.email === teacher);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return res.status(403).json({ message: 'ليس لديك صلاحية' });

  const exams = loadExams();
  const idx = exams.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'امتحان غير موجود' });
  if (user.role === 'teacher' && exams[idx].teacher !== teacher) return res.status(403).json({ message: 'لا يمكنك حذف امتحان لمعلم آخر' });

  exams.splice(idx, 1);
  saveExams(exams);
  res.json({ message: 'تم حذف الامتحان' });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: {
      auth: ['POST /login', 'POST /register'],
      videos: ['GET /videos', 'GET /videos/:id', 'POST /videos', 'DELETE /videos/:id'],
      progress: ['GET /progress/:studentEmail', 'POST /progress'],
      admin: ['GET /admin/users', 'GET /admin/stats'],
      health: ['GET /ping']
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`backend listening on http://localhost:${PORT}`);
});
