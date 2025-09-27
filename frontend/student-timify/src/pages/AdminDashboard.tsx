import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Users, MapPin, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RoomManagement from "@/components/RoomManagement";
import SubjectManagement from "@/components/SubjectManagement";
import FacultyManagement from "@/components/FacultyManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const stats = [
    { title: "Total Subjects", value: "12", icon: BookOpen },
    { title: "Faculty Members", value: "25", icon: Users },
    { title: "Rooms Available", value: "18", icon: MapPin },
    { title: "Timetables Generated", value: "3", icon: Calendar }
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
              <Button>Generate Master Timetable</Button>
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
            return (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <Icon className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="timetables">Timetables</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <SubjectManagement />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyManagement />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomManagement />
          </TabsContent>

          <TabsContent value="timetables">
            <Card>
              <CardHeader>
                <CardTitle>Timetable Management</CardTitle>
                <CardDescription>View and manage generated timetables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">3 timetables generated</p>
                  <Button variant="outline">Download Master Timetable</Button>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-center text-muted-foreground">Timetable preview will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;