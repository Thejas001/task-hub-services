
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "../components/DashboardLayout";

const WorkerDashboard = () => {
  const [jobRequests] = useState([
    { id: 1, customer: "Alice Brown", service: "Plumbing", date: "2024-01-15", status: "pending" },
    { id: 2, customer: "Tom Davis", service: "Plumbing", date: "2024-01-18", status: "accepted" },
  ]);

  const [completedJobs] = useState([
    { id: 1, customer: "Jane Smith", service: "Plumbing", rating: 5, feedback: "Excellent work!" },
    { id: 2, customer: "Mike Johnson", service: "Plumbing", rating: 4, feedback: "Good service" },
  ]);

  return (
    <DashboardLayout title="Worker Dashboard" userRole="worker">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">42</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">4.8</div>
            <p className="text-sm text-gray-500">⭐ Out of 5 stars</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">$2,340</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobRequests.map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{job.customer}</h4>
                    <p className="text-sm text-gray-600">{job.service} • {job.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={job.status === 'accepted' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    {job.status === 'pending' && (
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm">Accept</Button>
                      </div>
                    )}
                    {job.status === 'accepted' && (
                      <Button size="sm" variant="outline">Mark Complete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedJobs.map(job => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{job.customer}</h4>
                    <div className="flex">
                      {[...Array(job.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{job.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
