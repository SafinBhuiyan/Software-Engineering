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
    return { user_id: '1', role: 'teacher' };
}

// Generate 30-minute slots between time_from and time_to
function generateSlots(roomId, date, timeFrom, timeTo) {
    const slots = [];
    let currentTime = new Date(timeFrom);
    const endTime = new Date(timeTo);
    
    while (currentTime < endTime) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes
        
        if (slotEnd <= endTime) {
            slots.push({
                slot_id: mockSlots.length + slots.length + 1,
                room_id: roomId,
                slot_start: slotStart.toISOString(),
                slot_end: slotEnd.toISOString(),
                is_booked: 'N'
            });
        }
        
        currentTime = slotEnd;
    }
    
    return slots;
}

module.exports = function(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname === '/api/teacher/create-room' && method === 'POST') {
        const user = getUserFromSession(req);
        if (!user || user.role !== 'teacher') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        const { room_no, date, time_from, time_to } = req.body;
        
        if (!room_no || !date || !time_from || !time_to) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        // Validate time format
        const timeFrom = new Date(`${date}T${time_from}`);
        const timeTo = new Date(`${date}T${time_to}`);
        
        if (isNaN(timeFrom.getTime()) || isNaN(timeTo.getTime())) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid time format' }));
            return;
        }

        if (timeFrom >= timeTo) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'End time must be after start time' }));
            return;
        }

        // Create new room
        const newRoom = {
            room_id: mockRooms.length + 1,
            room_no: room_no,
            date_available: date,
            time_from: timeFrom.toISOString(),
            time_to: timeTo.toISOString()
        };

        mockRooms.push(newRoom);

        // Generate 30-minute slots
        const newSlots = generateSlots(newRoom.room_id, date, timeFrom, timeTo);
        mockSlots.push(...newSlots);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            room_id: newRoom.room_id,
            slots_created: newSlots.length,
            message: 'Room created successfully with ' + newSlots.length + ' slots'
        }));

    } else if (pathname === '/api/teacher/bookings' && method === 'GET') {
        const user = getUserFromSession(req);
        if (!user || user.role !== 'teacher') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        // Get all bookings with student and slot information
        const allBookings = mockBookings.map(booking => {
            const slot = mockSlots.find(s => s.slot_id === booking.slot_id);
            const room = mockRooms.find(r => r.room_id === slot.room_id);
            
            return {
                booking_id: booking.booking_id,
                student_id: booking.student_id,
                room_no: room.room_no,
                date: slot.slot_start.split('T')[0],
                time_start: slot.slot_start.split('T')[1].substring(0, 5),
                time_end: slot.slot_end.split('T')[1].substring(0, 5),
                token_code: booking.token_code,
                booking_time: booking.booking_time,
                status: 'Booked'
            };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ bookings: allBookings }));

    } else if (pathname === '/api/teacher/rooms' && method === 'GET') {
        const user = getUserFromSession(req);
        if (!user || user.role !== 'teacher') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        // Get all rooms with slot information
        const roomsWithSlots = mockRooms.map(room => {
            const roomSlots = mockSlots.filter(slot => slot.room_id === room.room_id);
            const availableSlots = roomSlots.filter(slot => slot.is_booked === 'N').length;
            const bookedSlots = roomSlots.filter(slot => slot.is_booked === 'Y').length;
            
            return {
                room_id: room.room_id,
                room_no: room.room_no,
                date_available: room.date_available,
                time_from: room.time_from.split('T')[1].substring(0, 5),
                time_to: room.time_to.split('T')[1].substring(0, 5),
                total_slots: roomSlots.length,
                available_slots: availableSlots,
                booked_slots: bookedSlots
            };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ rooms: roomsWithSlots }));

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}; 