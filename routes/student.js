const crypto = require('crypto');

// Use real Oracle DB
const db = require('../db/oracle');

// Generate token code
function generateTokenCode(roomNo, date, time) {
    const dateStr = date.split('T')[0].replace(/-/g, '');
    const timeStr = time.split('T')[1].substring(0, 5).replace(':', '');
    return `ROOM${roomNo}-${dateStr}-${timeStr}`;
}

// Get user from session
async function getUserFromSession(req) {
    const cookies = req.headers.cookie;
    if (!cookies) return null;

    const sessionId = cookies.split(';')
        .find(c => c.trim().startsWith('sessionId='))
        ?.split('=')[1];

    if (!sessionId) return null;

    try {
        // Check session in database
        const sessions = await db.execute(
            'SELECT * FROM Sessions WHERE session_id = :session_id',
            [sessionId]
        );

        if (sessions.length === 0) return null;

        const session = sessions[0];
        // Check if session is expired (24 hours)
        const now = new Date();
        const sessionTime = new Date(session.CREATED_AT);
        if (now - sessionTime > 24 * 60 * 60 * 1000) {
            // Clean up expired session
            await db.execute('DELETE FROM Sessions WHERE session_id = :session_id', [sessionId]);
            return null;
        }

        return {
            user_id: session.USER_ID,
            role: session.ROLE
        };
    } catch (err) {
        console.error('Session verification error:', err);
        return null;
    }
}

module.exports = function(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname === '/api/student/slots' && method === 'GET') {
        (async () => {
            try {
                // Get available slots with room information
                const slots = await db.execute(`
                    SELECT s.slot_id, s.slot_start, s.slot_end, r.room_no
                    FROM Slots s
                    JOIN Rooms r ON s.room_id = r.room_id
                    WHERE s.is_booked = 'N'
                    ORDER BY s.slot_start
                `);

                const availableSlots = slots.map(slot => ({
                    slot_id: slot.SLOT_ID,
                    room_no: slot.ROOM_NO,
                    date: slot.SLOT_START instanceof Date ? slot.SLOT_START.toISOString().split('T')[0] : '',
                    time_start: slot.SLOT_START instanceof Date ? slot.SLOT_START.toISOString().split('T')[1].substring(0,5) : '',
                    time_end: slot.SLOT_END instanceof Date ? slot.SLOT_END.toISOString().split('T')[1].substring(0,5) : ''
                }));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ slots: availableSlots }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            }
        })();

    } else if (pathname === '/api/student/book' && method === 'POST') {
        (async () => {
            try {
                const user = await getUserFromSession(req);
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

                // Check if slot is available
                const slots = await db.execute(
                    'SELECT * FROM Slots WHERE slot_id = :slot_id AND is_booked = :is_booked',
                    [slot_id, 'N']
                );

                if (slots.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Slot not available' }));
                    return;
                }

                const slot = slots[0];

                // Get room information
                const rooms = await db.execute(
                    'SELECT * FROM Rooms WHERE room_id = :room_id',
                    [slot.ROOM_ID]
                );

                if (rooms.length === 0) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Room not found' }));
                    return;
                }

                const room = rooms[0];

                // Generate token code
                const tokenCode = generateTokenCode(
                    room.ROOM_NO,
                    slot.SLOT_START.toISOString(),
                    slot.SLOT_START.toISOString()
                );

                // Create booking
                await db.execute(
                    'INSERT INTO Bookings (slot_id, student_id, token_code) VALUES (:slot_id, :student_id, :token_code)',
                    [slot_id, user.user_id, tokenCode]
                );

                // Update slot as booked
                await db.execute(
                    'UPDATE Slots SET is_booked = :is_booked WHERE slot_id = :slot_id',
                    ['Y', slot_id]
                );

                // Get booking ID
                const bookings = await db.execute(
                    'SELECT booking_id FROM Bookings WHERE slot_id = :slot_id AND student_id = :student_id',
                    [slot_id, user.user_id]
                );

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    booking_id: bookings[0].BOOKING_ID,
                    token_code: tokenCode,
                    redirect: `/token?code=${tokenCode}`
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            }
        })();

    } else if (pathname === '/api/student/bookings' && method === 'GET') {
        (async () => {
            try {
                const user = await getUserFromSession(req);
                if (!user || user.role !== 'student') {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                    return;
                }

                // Get user's bookings
                const bookings = await db.execute(`
                    SELECT b.booking_id, b.token_code, b.booking_time,
                           r.room_no, s.slot_start, s.slot_end
                    FROM Bookings b
                    JOIN Slots s ON b.slot_id = s.slot_id
                    JOIN Rooms r ON s.room_id = r.room_id
                    WHERE b.student_id = :student_id
                    ORDER BY b.booking_time DESC
                `, [user.user_id]);

                const userBookings = bookings.map(booking => ({
                    booking_id: booking.BOOKING_ID,
                    room_no: booking.ROOM_NO,
                    date: booking.SLOT_START instanceof Date ? booking.SLOT_START.toISOString().split('T')[0] : '',
                    time_start: booking.SLOT_START instanceof Date ? booking.SLOT_START.toISOString().split('T')[1].substring(0, 5) : '',
                    time_end: booking.SLOT_END instanceof Date ? booking.SLOT_END.toISOString().split('T')[1].substring(0, 5) : '',
                    token_code: booking.TOKEN_CODE,
                    booking_time: booking.BOOKING_TIME
                }));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ bookings: userBookings }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            }
        })();

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
};