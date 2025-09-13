
const { LeaveRequest, User } = require('../models');

// 📌 Apply for Leave
exports.applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        const userId = req.user?.id; // Get from JWT

        console.log("Received request:", { userId, startDate, endDate, leaveType, reason });

        if (!userId) {
            return res.status(401).json({ message: "User ID missing from token" });
        }

        if (!startDate || !endDate || !leaveType || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Add leave type validation
        const validLeaveTypes = [
            'Sick Leave',
            'Casual Leave',
            'Earned Leave',
            'Maternity Leave',
            'Paternity Leave'
        ];
        
        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({ message: `Invalid leave type. Allowed types: ${validLeaveTypes.join(", ")}` });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        const existingLeave = await LeaveRequest.findOne({
            where: {
                userId,
                status: "approved",
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        });

        if (existingLeave) {
            return res.status(400).json({ message: "Overlapping leave request exists" });
        }

        const leave = await LeaveRequest.create({ userId, startDate, endDate, leaveType, reason });

        res.status(201).json({ message: "Leave request submitted", leave });

    } catch (error) {
        console.error("Error applying for leave:", error);  // Log detailed error
        res.status(500).json({ message: "Error applying for leave", error: error.message });
    }
};

// 📌 Get All Leave Requests (Admin)
exports.getAllLeaves = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

        const leaves = await LeaveRequest.findAll();
        console.log("Leaves:", leaves);
        res.json(leaves);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests', error });
    }
};
// exports.getAllAttendance = async (req, res) => {
//     try {
//         if (req.user.role !== 'Admin' && req.user.role !== 'Hr') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const attendanceRecords = await Attendance.findAll();
//         res.json(attendanceRecords);
//     } catch (error) {
//         console.error("Error fetching attendance records:", error);
//         res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
//     }
// };
exports.cancelLeave = async (req, res) => {
    try {
        const userId = req.user.id;
        const { leaveId } = req.params;

        // Find the leave request
        const leave = await LeaveRequest.findOne({ where: { id: leaveId, userId } });

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        if (leave.status === "approved") {
            return res.status(400).json({ message: "Approved leave cannot be canceled" });
        }

        // Delete the leave request
        await leave.destroy();

        res.json({ message: "Leave request canceled successfully" });

    } catch (error) {
        console.error("Error canceling leave:", error);
        res.status(500).json({ message: "Error canceling leave", error: error.message });
    }
};
// 📌 Approve or Reject Leave (Admin)
exports.updateLeaveStatus = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await LeaveRequest.findByPk(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        leave.status = status;
        await leave.save();
        res.json({ message: `Leave ${status}`, leave });

    } catch (error) {
        res.status(500).json({ message: 'Error updating leave status', error });
    }
};

// 📌 Get User's Leave History
exports.getUserLeaves = async (req, res) => {
    try {
        const userId = req.user.id;
        const leaves = await LeaveRequest.findAll({ where: { userId } });
        res.json(leaves);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave history', error });
    }
};
