const { WorkRequest, Employee } = require('../models');

// Get available work requests for the logged-in employee
exports.getAvailableWorkRequests = async (req, res) => {
  try {
    // Find the employee record for the logged-in user
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Find work requests that match the employee's workType, are not assigned, and are pending
    const requests = await WorkRequest.findAll({
      where: {
        workType: employee.workType,
        employeeId: null,
        status: 'pending'
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching work requests', error: error.message });
  }
};

exports.acceptWorkRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { WorkRequest, Employee } = require('../models');
    // Find the employee record for the logged-in user
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Find the work request
    const workRequest = await WorkRequest.findByPk(id);
    if (!workRequest) return res.status(404).json({ message: 'Work request not found' });
    if (workRequest.status !== 'pending' || workRequest.employeeId) {
      return res.status(400).json({ message: 'Work request is not available' });
    }

    // Assign to this employee
    workRequest.employeeId = employee.id;
    workRequest.status = 'accepted';
    await workRequest.save();

    res.json({ message: 'Work request accepted', workRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting work request', error: error.message });
  }
};

exports.getMyAcceptedWork = async (req, res) => {
  try {
    const { WorkRequest, Employee } = require('../models');
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const requests = await WorkRequest.findAll({
      where: {
        employeeId: employee.id,
        status: 'accepted'
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accepted work', error: error.message });
  }
};

exports.completeWorkRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { WorkRequest, Employee } = require('../models');
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const workRequest = await WorkRequest.findByPk(id);
    if (!workRequest) return res.status(404).json({ message: 'Work request not found' });
    if (workRequest.employeeId !== employee.id || workRequest.status !== 'accepted') {
      return res.status(400).json({ message: 'You can only complete your own accepted work' });
    }

    workRequest.status = 'completed';
    await workRequest.save();

    res.json({ message: 'Work marked as completed', workRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error completing work request', error: error.message });
  }
}; 