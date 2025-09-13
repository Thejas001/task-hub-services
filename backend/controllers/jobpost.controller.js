const { JobPost, Employee } = require('../models');
const User = require('../models/user.model');

exports.createJobPost = async (req, res) => {
    try {
        const { category, description, ratePerHour, ratePerDay, location } = req.body;
        const userId = req.user.id; // comes from JWT

        
            // Find employee (select minimal attributes to avoid missing-column issues)
            const employee = await Employee.findOne({ 
                where: { userId },
                attributes: ['id', 'userId']
            });
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
        const employee = await Employee.findOne({ 
            where: { userId },
            attributes: ['id', 'userId']
        });
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

// Admin: Get all job posts with filters
exports.getAllJobPosts = async (req, res) => {
    try {
        const { category, status, location, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
        
        // Build where clause
        const whereClause = {};
        if (category) whereClause.category = category;
        if (status) whereClause.status = status;
        if (location) whereClause.location = { [require('sequelize').Op.like]: `%${location}%` };

        // Build order clause
        const orderClause = [[sortBy, sortOrder.toUpperCase()]];

        const jobPosts = await JobPost.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'workType', 'rating', 'totalReviews']
                }
            ],
            order: orderClause
        });

        // Transform data for admin view
        const transformedPosts = jobPosts.map(post => ({
            id: post.id,
            category: post.category,
            description: post.description,
            ratePerHour: post.ratePerHour,
            ratePerDay: post.ratePerDay,
            location: post.location,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            worker: post.employee ? {
                id: post.employee.id,
                name: `${post.employee.firstName} ${post.employee.lastName}`,
                workType: post.employee.workType,
                rating: post.employee.rating,
                totalReviews: post.employee.totalReviews
            } : null,
            user: post.user ? {
                id: post.user.id,
                name: post.user.name,
                email: post.user.email
            } : null
        }));

        res.json({
            message: 'All job posts retrieved successfully',
            count: transformedPosts.length,
            jobPosts: transformedPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all job posts', error: error.message });
    }
};
