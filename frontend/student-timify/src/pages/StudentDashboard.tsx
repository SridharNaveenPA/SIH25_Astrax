import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Download, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    enrolledSubjects: 0,
    totalCredits: 0,
    classesThisWeek: 0
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch dashboard stats
      const statsResponse = await fetch("http://localhost:4000/api/student/dashboard-stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData);
      }

      // Fetch available subjects
      const subjectsResponse = await fetch("http://localhost:4000/api/student/available-subjects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setAvailableSubjects(subjectsData);
      }

      // Fetch my subjects
      const mySubjectsResponse = await fetch("http://localhost:4000/api/student/my-subjects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (mySubjectsResponse.ok) {
        const mySubjectsData = await mySubjectsResponse.json();
        setMySubjects(mySubjectsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (subjectId) => {
    try {
      setEnrolling(prev => ({ ...prev, [subjectId]: true }));
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:4000/api/student/enroll/${subjectId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        // Refresh data after successful enrollment
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to enroll in subject");
      }
    } catch (error) {
      console.error("Error enrolling in subject:", error);
      alert("Failed to enroll in subject");
    } finally {
      setEnrolling(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const handleDrop = async (subjectId) => {
    if (!confirm("Are you sure you want to drop this subject?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:4000/api/student/drop/${subjectId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        // Refresh data after successful drop
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to drop subject");
      }
    } catch (error) {
      console.error("Error dropping subject:", error);
      alert("Failed to drop subject");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const enrollmentStats = [
    { title: "Enrolled Subjects", value: dashboardStats.enrolledSubjects.toString(), icon: BookOpen },
    { title: "Total Credits", value: dashboardStats.totalCredits.toString(), icon: Clock },
    { title: "Classes This Week", value: dashboardStats.classesThisWeek.toString(), icon: Calendar }
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
                    <p className="text-2xl font-bold">
                      {loading ? "..." : stat.value}
                    </p>
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
                  {loading ? (
                    <div className="text-center py-8">Loading subjects...</div>
                  ) : availableSubjects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No subjects available</div>
                  ) : (
                    availableSubjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{subject.course_code} - {subject.course_name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                            <Badge variant="outline">{subject.course_type}</Badge>
                            {subject.instructor_name && (
                              <p className="text-sm text-muted-foreground">Instructor: {subject.instructor_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={subject.enrolled_count < subject.max_capacity ? "secondary" : "destructive"}>
                            {subject.enrolled_count}/{subject.max_capacity} enrolled
                          </Badge>
                          <Button 
                            size="sm" 
                            disabled={subject.enrolled_count >= subject.max_capacity || subject.is_enrolled || enrolling[subject.id]}
                            onClick={() => handleEnroll(subject.id)}
                          >
                            {enrolling[subject.id] ? "Enrolling..." : subject.is_enrolled ? "Enrolled" : "Enroll"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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
                  {loading ? (
                    <div className="text-center py-8">Loading enrolled subjects...</div>
                  ) : mySubjects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">You are not enrolled in any subjects</div>
                  ) : (
                    mySubjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{subject.course_code} - {subject.course_name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                            <Badge variant="outline">{subject.course_type}</Badge>
                            {subject.instructor_name && (
                              <p className="text-sm text-muted-foreground">Instructor: {subject.instructor_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Enrolled</Badge>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDrop(subject.id)}
                          >
                            Drop
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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