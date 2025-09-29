import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, RefreshCw, Download, BookOpen, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { toast } from "sonner";
import { saveAs } from 'file-saver';

interface TimetableSlot {
  course_code: string;
  course_name: string;
  instructor: string;
  room: string;
  building: string;
  slot_type: string;
  time: string;
}

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState<(TimetableSlot[] | null)[][]>([]);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
    '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchStudentTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/student/timetable', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setTimetable(data.timetable);
      } else {
        toast.error('Failed to fetch your timetable');
      }
    } catch (error) {
      console.error('Error fetching student timetable:', error);
      toast.error('Error fetching timetable');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/student/timetable/export/excel', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, 'my_timetable.xlsx');
        toast.success('Timetable exported to Excel successfully!');
      } else {
        toast.error('Failed to export timetable');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error exporting timetable');
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/student/timetable/export/csv', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, 'my_timetable.csv');
        toast.success('Timetable exported to CSV successfully!');
      } else {
        toast.error('Failed to export timetable');
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Error exporting timetable');
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/student/timetable/export/pdf', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, 'my_timetable.pdf');
        toast.success('Timetable exported to PDF successfully!');
      } else {
        toast.error('Failed to export timetable');
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error exporting timetable');
    }
  };

  const downloadTimetable = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-timetable.csv';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    let csv = 'Time,' + days.join(',') + '\r\n';
    
    timeSlots.forEach((timeSlot, slotIndex) => {
      let row = '"' + timeSlot + '",';
      days.forEach((day, dayIndex) => {
        const slots = timetable[dayIndex]?.[slotIndex] || [];
        const slotText = slots.length > 0 
          ? slots.map(slot => `${slot.course_code} (${slot.instructor}, ${slot.room})`).join('; ')
          : 'Free';
        row += '"' + slotText.replace(/"/g, '""') + '",';
      });
      csv += row.slice(0, -1) + '\r\n';
    });
    
    return csv;
  };

  const getTotalClassesToday = (dayIndex: number) => {
    let count = 0;
    for (let slot = 0; slot < 8; slot++) {
      const slots = timetable[dayIndex]?.[slot] || [];
      count += slots.length;
    }
    return count;
  };

  useEffect(() => {
    fetchStudentTimetable();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Timetable
            </CardTitle>
            <CardDescription>
              Your personalized class schedule based on enrolled subjects
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchStudentTimetable}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              disabled={loading || timetable.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              disabled={loading || timetable.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              disabled={loading || timetable.length === 0}
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
        
        {/* Weekly Overview */}
        {timetable.length > 0 && (
          <div className="flex gap-2 mt-4">
            {days.map((day, dayIndex) => {
              const classCount = getTotalClassesToday(dayIndex);
              return (
                <div key={day} className="text-center">
                  <div className="text-xs text-muted-foreground">{day.slice(0, 3)}</div>
                  <Badge variant={classCount > 0 ? "default" : "secondary"} className="text-xs">
                    {classCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading your timetable...
          </div>
        ) : timetable.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No timetable available</p>
            <p className="text-sm text-muted-foreground">
              Please enroll in subjects or wait for the timetable to be generated
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-medium text-left min-w-24">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="border p-2 bg-muted font-medium text-center min-w-40">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, slotIndex) => (
                  <tr key={slotIndex}>
                    <td className="border p-2 font-medium bg-muted/50">
                      {timeSlot}
                    </td>
                    {days.map((day, dayIndex) => {
                      const slots = timetable[dayIndex]?.[slotIndex] || [];
                      return (
                        <td key={`${day}-${slotIndex}`} className="border p-2 h-20 align-top">
                          {slots.length > 0 ? (
                            <div className="space-y-1">
                              {slots.map((slot, idx) => (
                                <div key={idx} className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                                  <div className="font-medium text-blue-800">
                                    {slot.course_code}
                                  </div>
                                  <div className="text-blue-600">
                                    {slot.course_name}
                                  </div>
                                  <div className="text-gray-600 mt-1">
                                    {slot.instructor}
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {slot.room}
                                    </Badge>
                                    <Badge 
                                      variant={slot.slot_type === 'lab' ? 'destructive' : 'default'} 
                                      className="text-xs"
                                    >
                                      {slot.slot_type}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-center text-sm py-2">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentTimetable;