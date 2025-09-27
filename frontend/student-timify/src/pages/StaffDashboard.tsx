import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Download, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const teachingStats = [
    { title: "Subjects Assigned", value: "4", icon: Calendar },
    { title: "Classes Per Week", value: "16", icon: Clock },
    { title: "Total Students", value: "180", icon: Users }
  ];

  const mySubjects = [
    { code: "CS301", name: "Data Structures", students: 45, room: "Lab-A", credits: 3 },
    { code: "CS302", name: "Database Systems", students: 38, room: "Room-101", credits: 3 },
    { code: "CS401", name: "Machine Learning", students: 35, room: "Lab-B", credits: 4 },
    { code: "CS303", name: "Operating Systems", students: 42, room: "Room-102", credits: 3 }
  ];

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00", "3:00-4:00"];

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
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Schedule
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {teachingStats.map((stat, index) => {
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

        {/* Main Content */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="subjects">My Subjects</TabsTrigger>
            <TabsTrigger value="rooms">Room Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your teaching schedule for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted">Time</th>
                        {weekDays.map(day => (
                          <th key={day} className="border p-2 bg-muted min-w-32">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(slot => (
                        <tr key={slot}>
                          <td className="border p-2 font-medium">{slot}</td>
                          {weekDays.map(day => (
                            <td key={`${day}-${slot}`} className="border p-2 h-16">
                              {(day === "Monday" && slot === "9:00-10:00") ? (
                                <div className="text-xs bg-primary/10 p-1 rounded">
                                  <div className="font-medium">CS301</div>
                                  <div>Lab-A</div>
                                </div>
                              ) : (day === "Tuesday" && slot === "10:00-11:00") ? (
                                <div className="text-xs bg-secondary/10 p-1 rounded">
                                  <div className="font-medium">CS302</div>
                                  <div>Room-101</div>
                                </div>
                              ) : null}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-center text-muted-foreground mt-4">
                  Complete schedule will appear here once timetable is generated
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>Subjects assigned to you this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySubjects.map((subject) => (
                    <div key={subject.code} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{subject.code} - {subject.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {subject.students} students
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {subject.room}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{subject.credits} Credits</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Room Availability</CardTitle>
                <CardDescription>Check room schedules and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-8">
                  <p className="text-center text-muted-foreground">
                    Room availability schedule will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StaffDashboard;