const crypto = require('crypto');

// Mock database for demo (replace with Oracle DB in production)
let mockUsers = {
    students: [
        { student_id: 'CSE2025001', name: 'Safin', batch: '2025', dept: 'Computer Science', email: 'safin@university.edu', password: 'password123' }
    ],
    teachers: [
        { teacher_id: 1, name: 'Dr. Smith', email: 'smith@university.edu', password: 'password123' }
    ]
};

let sessions = {};

// Generate session ID
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

// Hash password (simple hash for demo)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify session
function verifySession(sessionId) {
    const session = sessions[sessionId];
    if (!session) return null;
    
    // Check if session is expired (24 hours)
    const now = new Date();
    const sessionTime = new Date(session.created_at);
    if (now - sessionTime > 24 * 60 * 60 * 1000) {
        delete sessions[sessionId];
        return null;
    }
    
    return session;
}

module.exports = function(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        let user = null;
        if (role === 'student') {
            user = mockUsers.students.find(s => s.email === email && s.password === password);
        } else if (role === 'teacher') {
            user = mockUsers.teachers.find(t => t.email === email && t.password === password);
        }

        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
            return;
        }

        // Create session
        const sessionId = generateSessionId();
        sessions[sessionId] = {
            user_id: role === 'student' ? user.student_id : user.teacher_id.toString(),
            role: role,
            created_at: new Date()
        };

        // Set cookie
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            role: role,
            redirect: role === 'student' ? '/dashboard_student' : '/dashboard_teacher'
        }));

    } else if (pathname === '/api/auth/register' && method === 'POST') {
        const { name, email, password, role, student_id, batch, dept } = req.body;
        
        if (!name || !email || !password || !role) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        // Check if user already exists
        const existingStudent = mockUsers.students.find(s => s.email === email);
        const existingTeacher = mockUsers.teachers.find(t => t.email === email);
        
        if (existingStudent || existingTeacher) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User already exists' }));
            return;
        }

        if (role === 'student') {
            if (!student_id || !batch || !dept) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing student information' }));
                return;
            }
            
            const newStudent = {
                student_id,
                name,
                batch,
                dept,
                email,
                password: hashPassword(password)
            };
            mockUsers.students.push(newStudent);
        } else if (role === 'teacher') {
            const newTeacher = {
                teacher_id: mockUsers.teachers.length + 1,
                name,
                email,
                password: hashPassword(password)
            };
            mockUsers.teachers.push(newTeacher);
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Registration successful' }));

    } else if (pathname === '/api/auth/logout' && method === 'POST') {
        const cookies = req.headers.cookie;
        if (cookies) {
            const sessionId = cookies.split(';')
                .find(c => c.trim().startsWith('sessionId='))
                ?.split('=')[1];
            
            if (sessionId) {
                delete sessions[sessionId];
            }
        }

        res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));

    } else if (pathname === '/api/auth/check' && method === 'GET') {
        const cookies = req.headers.cookie;
        if (!cookies) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No session' }));
            return;
        }

        const sessionId = cookies.split(';')
            .find(c => c.trim().startsWith('sessionId='))
            ?.split('=')[1];
        
        if (!sessionId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No session' }));
            return;
        }

        const session = verifySession(sessionId);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid session' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            user_id: session.user_id, 
            role: session.role 
        }));

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}; 