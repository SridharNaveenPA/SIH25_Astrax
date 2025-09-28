import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Download, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  subjectsAssigned: number;
  classesPerWeek: number;
  totalStudents: number;
}

interface Subject {
  id: number;
  course_code: string;
  course_name: string;
  semester: string;
  credits: number;
  course_type: string;
  min_lab_hours: number;
  min_theory_hours: number;
  max_capacity: number;
  enrolled_students: number;
  room: string;
}

interface ScheduleSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_type: string;
  course_code: string;
  course_name: string;
  room_id: string;
  building: string;
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ subjectsAssigned: 0, classesPerWeek: 0, totalStudents: 0 });
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/staff-login');
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/staff/dashboard-stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setStats(data || { subjectsAssigned: 0, classesPerWeek: 0, totalStudents: 0 });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ subjectsAssigned: 0, classesPerWeek: 0, totalStudents: 0 });
    }
  };

  const fetchMySubjects = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/staff/my-subjects', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setMySubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setMySubjects([]);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/staff/schedule', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setSchedule([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchMySubjects(),
        fetchSchedule()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const teachingStats = [
    { title: "Subjects Assigned", value: stats.subjectsAssigned.toString(), icon: Calendar },
    { title: "Classes Per Week", value: stats.classesPerWeek.toString(), icon: Clock },
    { title: "Total Students", value: stats.totalStudents.toString(), icon: Users }
  ];

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00", "3:00-4:00"];

  const getScheduleForSlot = (dayIndex: number, timeSlot: string) => {
    const [startTime] = timeSlot.split('-');
    return schedule.find(slot => 
      slot.day_of_week === dayIndex + 1 && 
      slot.start_time.substring(0, 5) === startTime
    );
  };

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
                          {weekDays.map((day, dayIndex) => {
                            const scheduleSlot = getScheduleForSlot(dayIndex, slot);
                            return (
                              <td key={`${day}-${slot}`} className="border p-2 h-16">
                                {scheduleSlot ? (
                                  <div className="text-xs bg-primary/10 p-1 rounded">
                                    <div className="font-medium">{scheduleSlot.course_code}</div>
                                    <div>{scheduleSlot.room_id}</div>
                                  </div>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-center text-muted-foreground mt-4">
                  {loading ? 'Loading schedule...' : schedule.length === 0 ? 'Complete schedule will appear here once timetable is generated' : ''}
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
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading subjects...</p>
                  ) : mySubjects.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No subjects assigned yet</p>
                  ) : (
                    mySubjects.map((subject) => (
                      <div key={subject.course_code} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{subject.course_code} - {subject.course_name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {subject.enrolled_students}/{subject.max_capacity} students
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {subject.room}
                            </span>
                            <span>{subject.semester}</span>
                            <span>{subject.course_type}</span>
                          </div>
                          {(subject.min_lab_hours > 0 || subject.min_theory_hours > 0) && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              {subject.min_lab_hours > 0 && <span>Lab Hours: {subject.min_lab_hours}</span>}
                              {subject.min_theory_hours > 0 && <span>Theory Hours: {subject.min_theory_hours}</span>}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">{subject.credits} Credits</Badge>
                      </div>
                    ))
                  )}
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