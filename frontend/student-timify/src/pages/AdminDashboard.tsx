import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Users, MapPin, Calendar, LogOut, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import RoomManagement from "@/components/RoomManagement";
import SubjectManagement from "@/components/SubjectManagement";
import FacultyManagement from "@/components/FacultyManagement";
import CreditLimitManagement from "@/components/CreditLimitManagement";
import MasterTimetable from "@/components/MasterTimetable";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalSubjects: 0,
    facultyMembers: 0,
    roomsAvailable: 0,
    timetablesGenerated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/admin/dashboard-stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const resetTimetables = async () => {
    if (!confirm("Are you sure you want to reset all generated timetables? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/admin/reset-timetables", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchDashboardStats(); // Refresh stats to show updated count
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to reset timetables");
      }
    } catch (error) {
      console.error("Error resetting timetables:", error);
      toast.error("Error resetting timetables");
    }
  };

  const stats = [
    { title: "Total Subjects", value: dashboardStats.totalSubjects.toString(), icon: BookOpen },
    { title: "Faculty Members", value: dashboardStats.facultyMembers.toString(), icon: Users },
    { title: "Rooms Available", value: dashboardStats.roomsAvailable.toString(), icon: MapPin },
    { title: "Timetables Generated", value: dashboardStats.timetablesGenerated.toString(), icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isTimetablesStat = stat.title === "Timetables Generated";
            return (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <Icon className="w-8 h-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                  </div>
                  {isTimetablesStat && !loading && parseInt(stat.value) > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetTimetables}
                      className="ml-2"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="rooms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="credit-limits">Credit Limits</TabsTrigger>
            <TabsTrigger value="master-timetable">Master Timetable</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <RoomManagement />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyManagement />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectManagement />
          </TabsContent>

          <TabsContent value="credit-limits">
            <CreditLimitManagement />
          </TabsContent>

          <TabsContent value="master-timetable">
            <MasterTimetable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;