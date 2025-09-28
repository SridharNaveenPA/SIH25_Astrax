import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

interface TimetableSlot {
  course_code: string;
  course_name: string;
  instructor: string;
  room: string;
  building: string;
  slot_type: string;
  time: string;
}

const MasterTimetable = () => {
  const [timetable, setTimetable] = useState<(TimetableSlot[] | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
    '1:00-2:00 (Lunch)', '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'
  ];

  const fetchMasterTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/admin/master-timetable');
      const data = await response.json();
      
      if (data.success) {
        setTimetable(data.timetable);
      } else {
        toast.error('Failed to fetch timetable');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Error fetching timetable');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    setGenerating(true);
    try {
      const response = await fetch('http://localhost:4000/api/admin/generate-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          created_by: 1 // Admin user ID
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimetable(data.timetable);
        toast.success('Master timetable generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Error generating timetable');
    } finally {
      setGenerating(false);
    }
  };

  const downloadTimetable = () => {
    // Create CSV content
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'master-timetable.csv';
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
        // Handle lunch break (slot 4)
        if (slotIndex === 4) {
          row += '"Lunch Break",';
        } else {
          const slots = timetable[dayIndex]?.[slotIndex] || [];
          const slotText = slots.length > 0 
            ? slots.map(slot => {
                if (typeof slot === 'string') {
                  return slot; // Handle legacy string format
                } else {
                  return `${slot.course_code} (${slot.instructor}, ${slot.room})`;
                }
              }).join('; ')
            : 'Free';
          row += '"' + slotText.replace(/"/g, '""') + '",';
        }
      });
      csv += row.slice(0, -1) + '\r\n'; // Remove last comma
    });
    
    return csv;
  };

  useEffect(() => {
    fetchMasterTimetable();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Master Timetable
            </CardTitle>
            <CardDescription>
              Complete schedule for all subjects, faculty, and rooms
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchMasterTimetable}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadTimetable}
              disabled={loading || timetable.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={generateTimetable}
              disabled={generating}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Timetable'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading timetable...
          </div>
        ) : timetable.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No timetable generated yet</p>
            <Button onClick={generateTimetable} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Master Timetable'
              )}
            </Button>
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
                    <th key={day} className="border p-2 bg-muted font-medium text-center min-w-48">
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
                      // Handle lunch break (slot 4)
                      if (slotIndex === 4) {
                        return (
                          <td key={`${day}-${slotIndex}`} className="border p-2 h-20 align-middle text-center bg-orange-50">
                            <div className="text-sm font-medium text-orange-600">
                              🍽️ Lunch Break
                            </div>
                          </td>
                        );
                      }
                      
                      const slots = timetable[dayIndex]?.[slotIndex] || [];
                      return (
                        <td key={`${day}-${slotIndex}`} className="border p-2 h-20 align-top">
                          {slots.length > 0 ? (
                            <div className="space-y-1">
                              {slots.map((slot, idx) => {
                                // Handle both string and object formats
                                if (typeof slot === 'string') {
                                  return (
                                    <div key={idx} className="text-xs bg-primary/10 p-2 rounded border">
                                      <div className="font-medium text-primary">
                                        {slot}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={idx} className="text-xs bg-primary/10 p-2 rounded border">
                                      <div className="font-medium text-primary">
                                        {slot.course_code}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {slot.instructor}
                                      </div>
                                      <div className="flex justify-between items-center mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {slot.room}
                                        </Badge>
                                        <Badge 
                                          variant={slot.slot_type === 'lab' ? 'destructive' : 'default'} 
                                          className="text-xs"
                                        >
                                          {slot.slot_type || 'theory'}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                }
                              })}
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

export default MasterTimetable;