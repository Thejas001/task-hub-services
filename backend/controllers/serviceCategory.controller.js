const { ServiceCategory, Employee } = require('../models');

exports.listCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    // Attach active worker counts (accepted applications) per category title
    const results = await Promise.all(categories.map(async (cat) => {
      const activeWorkers = await Employee.count({
        where: { workType: cat.title, applicationStatus: 'accepted' }
      });
      return { ...cat.toJSON(), activeWorkers };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { title, description, icon, color } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const created = await ServiceCategory.create({ title, description, icon, color });
    res.status(201).json({ message: 'Category created', data: created });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// Get all work types for dropdowns
exports.getWorkTypes = async (req, res) => {
  try {
    // Get unique work types from service categories
    const categories = await ServiceCategory.findAll({
      attributes: ['title'],
      where: { isActive: true }
    });
    
    // Also include common work types that might not be in categories yet
    const commonWorkTypes = [
      'Plumbing',
      'Electrical', 
      'Cleaning',
      'Gardening',
      'Painting',
      'Carpentry',
      'AC Repair',
      'Appliance Repair',
      'Roofing',
      'Flooring',
      'Interior Design',
      'Landscaping',
      'Security Services',
      'Moving Services'
    ];
    
    // Combine and deduplicate
    const allWorkTypes = [
      ...new Set([
        ...categories.map(cat => cat.title),
        ...commonWorkTypes
      ])
    ].sort();
    
    res.json({
      success: true,
      workTypes: allWorkTypes
    });
  } catch (error) {
    console.error('Error fetching work types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching work types',
      error: error.message
    });
  }
};


