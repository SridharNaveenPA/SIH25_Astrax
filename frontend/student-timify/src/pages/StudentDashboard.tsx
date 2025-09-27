import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Download, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const enrollmentStats = [
    { title: "Enrolled Subjects", value: "6", icon: BookOpen },
    { title: "Total Credits", value: "18", icon: Clock },
    { title: "Classes This Week", value: "24", icon: Calendar }
  ];

  const availableSubjects = [
    { code: "CS301", name: "Data Structures", credits: 3, enrolled: 45, capacity: 60 },
    { code: "CS302", name: "Database Systems", credits: 3, enrolled: 38, capacity: 50 },
    { code: "MA301", name: "Discrete Mathematics", credits: 4, enrolled: 52, capacity: 55 },
    { code: "CS303", name: "Operating Systems", credits: 3, enrolled: 41, capacity: 60 }
  ];

  const mySubjects = [
    { code: "CS201", name: "Object Oriented Programming", credits: 3, status: "enrolled" },
    { code: "CS202", name: "Computer Networks", credits: 3, status: "enrolled" },
    { code: "MA201", name: "Linear Algebra", credits: 4, status: "enrolled" },
    { code: "CS203", name: "Software Engineering", credits: 3, status: "enrolled" },
    { code: "CS204", name: "Web Development", credits: 3, status: "enrolled" },
    { code: "EN201", name: "Technical Writing", credits: 2, status: "enrolled" }
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
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Timetable
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
          {enrollmentStats.map((stat, index) => {
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
        <Tabs defaultValue="enrollment" className="space-y-4">
          <TabsList>
            <TabsTrigger value="enrollment">Subject Enrollment</TabsTrigger>
            <TabsTrigger value="timetable">My Timetable</TabsTrigger>
            <TabsTrigger value="enrolled">My Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment">
            <Card>
              <CardHeader>
                <CardTitle>Available Subjects</CardTitle>
                <CardDescription>Enroll in subjects for this semester (Deadline: Dec 31, 2024)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableSubjects.map((subject) => (
                    <div key={subject.code} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{subject.code} - {subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={subject.enrolled < subject.capacity ? "secondary" : "destructive"}>
                          {subject.enrolled}/{subject.capacity} enrolled
                        </Badge>
                        <Button 
                          size="sm" 
                          disabled={subject.enrolled >= subject.capacity}
                        >
                          Enroll
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <Card>
              <CardHeader>
                <CardTitle>My Timetable</CardTitle>
                <CardDescription>Your personalized class schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-8">
                  <p className="text-center text-muted-foreground">
                    Your timetable will appear here once the admin generates the master timetable
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrolled">
            <Card>
              <CardHeader>
                <CardTitle>My Enrolled Subjects</CardTitle>
                <CardDescription>Subjects you are currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mySubjects.map((subject) => (
                    <div key={subject.code} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{subject.code} - {subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                      </div>
                      <Badge variant="secondary">Enrolled</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;