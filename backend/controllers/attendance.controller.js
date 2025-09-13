


const Attendance = require('../models/attendance.model');

exports.checkIn = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const today = new Date().toISOString().split('T')[0];
        let attendance = await Attendance.findOne({ where: { userId, date: today } });

        if (!attendance) {
            // First check-in of the day
            attendance = await Attendance.create({
                userId,
                date: today,
                status: 'Absent',
                times: JSON.stringify([{ checkIn: new Date().toISOString(), checkOut: null }]), // ✅ Store as JSON string
                inOutStatus: 'IN',
                checkInCount: 1, 
                checkOutCount: 0
            });
        } else {
            if (attendance.inOutStatus === 'IN') {
                return res.status(400).json({ message: 'Already checked in. Please check out first.' });
            }

            // Convert times to an array
            let times = attendance.times ? JSON.parse(attendance.times) : [];

            // Append new check-in
            times.push({ checkIn: new Date().toISOString(), checkOut: null });

            // Update attendance record
            await Attendance.update(
                {
                    times: JSON.stringify(times),
                    inOutStatus: 'IN',
                    checkInCount: attendance.checkInCount + 1
                },
                { where: { id: attendance.id } }
            );
        }

        const updatedAttendance = await Attendance.findOne({ where: { userId, date: today } });
        res.status(201).json({ message: 'Checked in successfully', attendance: updatedAttendance });

    } catch (error) {
        console.error("Error during check-in:", error);
        res.status(500).json({ message: 'Error during check-in', error: error.message });
    }
};


// ✅ Get Attendance by User ID
exports.getAttendanceByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const attendanceRecords = await Attendance.findAll({ where: { userId } });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this user" });
        }

        res.json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance by user ID:", error);
        res.status(500).json({ message: "Error fetching attendance records", error: error.message });
    }
};


exports.checkOut = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const today = new Date().toISOString().split('T')[0];
        let attendance = await Attendance.findOne({ where: { userId, date: today } });

        if (!attendance || attendance.inOutStatus === 'OUT') {
            return res.status(400).json({ message: 'Cannot check out without checking in first.' });
        }

        let times = attendance.times ? JSON.parse(attendance.times) : [];

        if (times.length === 0 || times[times.length - 1].checkOut !== null) {
            return res.status(400).json({ message: 'Cannot check out without checking in first.' });
        }

        // Update last check-in entry with check-out time
        times[times.length - 1].checkOut = new Date().toISOString();

        // Calculate total worked hours
        let totalHours = times.reduce((sum, entry) => {
            if (entry.checkIn && entry.checkOut) {
                return sum + ((new Date(entry.checkOut) - new Date(entry.checkIn)) / (1000 * 60 * 60));
            }
            return sum;
        }, 0);

        // Update attendance record
        await Attendance.update(
            {
                times: JSON.stringify(times),
                inOutStatus: 'OUT',
                totalHours: totalHours,
                checkOutCount: attendance.checkOutCount + 1,
                status: totalHours >= 9 ? 'Present' : 'Absent'
            },
            { where: { id: attendance.id } }
        );

        const updatedAttendance = await Attendance.findOne({ where: { id: attendance.id } });

        res.status(200).json({ message: 'Checked out successfully', attendance: updatedAttendance });

    } catch (error) {
        console.error("Error during check-out:", error);
        res.status(500).json({ message: 'Error during check-out', error: error.message });
    }
};


// ✅ Admin: Approve Attendance (Single/Multiple)
exports.approveAttendance = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Hr')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { attendanceIds, status } = req.body;

        if (!attendanceIds || attendanceIds.length === 0 || !status) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid approval status' });
        }

        await Attendance.update(
            { approvalStatus: status, approvedBy: req.user.id },
            { where: { id: attendanceIds } }
        );

        res.json({ message: `Attendance marked as ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error approving attendance', error });
    }
};


// ✅ Get All Attendance
exports.getAllAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Hr') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const attendanceRecords = await Attendance.findAll();
        res.json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
    }
};

// ✅ Delete Attendance
exports.deleteAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const attendance = await Attendance.findByPk(id);

        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

        await attendance.destroy();
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attendance', error });
    }
};
