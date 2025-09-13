const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class NotificationService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket connection
    this.server = null;
  }

  initialize(server) {
    this.server = new WebSocket.Server({ 
      server,
      path: '/ws/notifications'
    });

    this.server.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'authenticate') {
            this.authenticateClient(ws, data.token);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });

    console.log('Notification service initialized');
  }

  authenticateClient(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      this.clients.set(decoded.id, ws);
      ws.userId = decoded.id;
      
      ws.send(JSON.stringify({
        type: 'authenticated',
        message: 'Successfully connected to notifications'
      }));
      
      console.log(`Client authenticated: ${decoded.id}`);
    } catch (error) {
      console.error('Authentication failed:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
      ws.close();
    }
  }

  removeClient(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      console.log(`Client disconnected: ${ws.userId}`);
    }
  }

  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
      return true;
    }
    return false;
  }

  sendToAll(notification) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }

  sendToAdmins(notification) {
    // In a real implementation, you would filter by admin role
    // For now, we'll send to all connected clients
    this.sendToAll(notification);
  }

  // Notification types
  notifyWorkerApplicationSubmitted(workerId, workerName) {
    const notification = {
      type: 'worker_application_submitted',
      title: 'New Worker Application',
      message: `${workerName} has submitted a worker application`,
      data: { workerId, workerName },
      timestamp: new Date().toISOString()
    };
    
    this.sendToAdmins(notification);
  }

  notifyApplicationApproved(userId, workerName) {
    const notification = {
      type: 'application_approved',
      title: 'Application Approved',
      message: `Your worker application has been approved! Welcome to the platform.`,
      data: { workerName },
      timestamp: new Date().toISOString()
    };
    
    this.sendToUser(userId, notification);
  }

  notifyApplicationRejected(userId, workerName, reason) {
    const notification = {
      type: 'application_rejected',
      title: 'Application Rejected',
      message: `Your worker application was rejected. Reason: ${reason}`,
      data: { workerName, reason },
      timestamp: new Date().toISOString()
    };
    
    this.sendToUser(userId, notification);
  }

  notifyNewBooking(workerId, customerName, serviceType) {
    const notification = {
      type: 'new_booking',
      title: 'New Booking',
      message: `${customerName} has booked you for ${serviceType}`,
      data: { customerName, serviceType },
      timestamp: new Date().toISOString()
    };
    
    this.sendToUser(workerId, notification);
  }

  notifyPaymentReceived(workerId, amount, serviceType) {
    const notification = {
      type: 'payment_received',
      title: 'Payment Received',
      message: `You received ₹${amount} for ${serviceType}`,
      data: { amount, serviceType },
      timestamp: new Date().toISOString()
    };
    
    this.sendToUser(workerId, notification);
  }

  notifySystemMaintenance(message) {
    const notification = {
      type: 'system_maintenance',
      title: 'System Maintenance',
      message: message,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAll(notification);
  }
}

module.exports = new NotificationService();
