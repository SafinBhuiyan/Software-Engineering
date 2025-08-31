const crypto = require('crypto');

// Mock data for demo (replace with Oracle DB in production)
let mockRooms = [
    {
        room_id: 1,
        room_no: '56',
        date_available: '2025-01-31',
        time_from: '2025-01-31T09:00:00',
        time_to: '2025-01-31T17:00:00'
    }
];

let mockSlots = [
    {
        slot_id: 1,
        room_id: 1,
        slot_start: '2025-01-31T10:00:00',
        slot_end: '2025-01-31T10:30:00',
        is_booked: 'N'
    },
    {
        slot_id: 2,
        room_id: 1,
        slot_start: '2025-01-31T10:30:00',
        slot_end: '2025-01-31T11:00:00',
        is_booked: 'N'
    },
    {
        slot_id: 3,
        room_id: 1,
        slot_start: '2025-01-31T11:00:00',
        slot_end: '2025-01-31T11:30:00',
        is_booked: 'N'
    }
];

let mockBookings = [];

// Generate token code
function generateTokenCode(roomNo, date, time) {
    const dateStr = date.split('T')[0].replace(/-/g, '');
    const timeStr = time.split('T')[1].substring(0, 5).replace(':', '');
    return `ROOM${roomNo}-${dateStr}-${timeStr}`;
}

// Get user from session
function getUserFromSession(req) {
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    
    const sessionId = cookies.split(';')
        .find(c => c.trim().startsWith('sessionId='))
        ?.split('=')[1];
    
    if (!sessionId) return null;
    
    // This would normally check against the sessions table
    // For demo, we'll use a simple approach
    return { user_id: 'CSE2025001', role: 'student' };
}

module.exports = function(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname === '/api/student/slots' && method === 'GET') {
        // Get available slots
        const availableSlots = mockSlots
            .filter(slot => slot.is_booked === 'N')
            .map(slot => {
                const room = mockRooms.find(r => r.room_id === slot.room_id);
                return {
                    slot_id: slot.slot_id,
                    room_no: room.room_no,
                    date: slot.slot_start.split('T')[0],
                    time_start: slot.slot_start.split('T')[1].substring(0, 5),
                    time_end: slot.slot_end.split('T')[1].substring(0, 5)
                };
            });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ slots: availableSlots }));

    } else if (pathname === '/api/student/book' && method === 'POST') {
        const user = getUserFromSession(req);
        if (!user || user.role !== 'student') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        const { slot_id } = req.body;
        if (!slot_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Slot ID is required' }));
            return;
        }

        // Find the slot
        const slot = mockSlots.find(s => s.slot_id === parseInt(slot_id));
        if (!slot || slot.is_booked === 'Y') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Slot not available' }));
            return;
        }

        // Book the slot
        slot.is_booked = 'Y';
        
        // Create booking
        const room = mockRooms.find(r => r.room_id === slot.room_id);
        const tokenCode = generateTokenCode(
            room.room_no,
            slot.slot_start,
            slot.slot_start
        );

        const booking = {
            booking_id: mockBookings.length + 1,
            slot_id: slot.slot_id,
            student_id: user.user_id,
            booking_time: new Date().toISOString(),
            token_code: tokenCode
        };

        mockBookings.push(booking);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            booking_id: booking.booking_id,
            token_code: tokenCode,
            redirect: `/token?code=${tokenCode}`
        }));

    } else if (pathname === '/api/student/bookings' && method === 'GET') {
        const user = getUserFromSession(req);
        if (!user || user.role !== 'student') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        // Get user's bookings
        const userBookings = mockBookings
            .filter(booking => booking.student_id === user.user_id)
            .map(booking => {
                const slot = mockSlots.find(s => s.slot_id === booking.slot_id);
                const room = mockRooms.find(r => r.room_id === slot.room_id);
                return {
                    booking_id: booking.booking_id,
                    room_no: room.room_no,
                    date: slot.slot_start.split('T')[0],
                    time_start: slot.slot_start.split('T')[1].substring(0, 5),
                    time_end: slot.slot_end.split('T')[1].substring(0, 5),
                    token_code: booking.token_code,
                    booking_time: booking.booking_time
                };
            });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ bookings: userBookings }));

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}; 