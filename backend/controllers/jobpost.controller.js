const { JobPost, Employee } = require('../models');

exports.createJobPost = async (req, res) => {
    try {
        const { category, description, ratePerHour, ratePerDay, location } = req.body;
        const userId = req.user.id; // comes from JWT

        
            // Find employee
            const employee = await Employee.findOne({ where: { userId } });
            if (!employee) {
                return res.status(404).json({ message: "Employee profile not found" });
            }

        const jobPost = await JobPost.create({
            userId: userId,
            employeeId: employee.id,
            category,
            description,
            ratePerHour,
            ratePerDay,
            location,
            status: "active"
        });

        res.status(201).json({
            message: "Job post created successfully",
            jobPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating job post", error: error.message });
    }
};

// Employee views their own job posts
exports.getMyJobPosts = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT


        // Find the employee profile linked to this user
        const employee = await Employee.findOne({ where: { userId } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // Fetch all job posts created by this employee
        const jobPosts = await JobPost.findAll({
            where: { employeeId: employee.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: 'Job posts retrieved successfully',
            count: jobPosts.length,
            jobPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching job posts', error: error.message });
    }
};
