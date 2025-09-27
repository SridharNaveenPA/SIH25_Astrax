import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus } from "lucide-react";

interface Subject {
  id: number;
  course_code: string;
  course_name: string;
  semester: string;
  credits: number;
  prerequisites: string;
  instructor_id: number | null;
  instructor_name: string | null;
}

interface Instructor {
  id: number;
  name: string;
  department: string;
}

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    semester: '',
    credits: '',
    prerequisites: '',
    instructor_id: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/instructors');
      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingSubject 
        ? `http://localhost:4000/api/admin/subjects/${editingSubject.id}`
        : 'http://localhost:4000/api/admin/subjects';
      
      const method = editingSubject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: formData.course_code,
          course_name: formData.course_name,
          semester: formData.semester,
          credits: parseInt(formData.credits),
          prerequisites: formData.prerequisites,
          instructor_id: formData.instructor_id ? parseInt(formData.instructor_id) : null
        })
      });

      if (response.ok) {
        fetchSubjects();
        setIsDialogOpen(false);
        setEditingSubject(null);
        setFormData({ course_code: '', course_name: '', semester: '', credits: '', prerequisites: '', instructor_id: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save subject');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      course_code: subject.course_code,
      course_name: subject.course_name,
      semester: subject.semester,
      credits: subject.credits.toString(),
      prerequisites: subject.prerequisites || '',
      instructor_id: subject.instructor_id ? subject.instructor_id.toString() : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/subjects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSubjects();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setFormData({ course_code: '', course_name: '', semester: '', credits: '', prerequisites: '', instructor_id: '' });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subject Management</CardTitle>
            <CardDescription>Add and manage subjects for this semester</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                <DialogDescription>
                  {editingSubject ? 'Update subject details' : 'Add a new subject to the system'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course_code">Course Code</Label>
                    <Input
                      id="course_code"
                      value={formData.course_code}
                      onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                      placeholder="e.g., CS301, MA201"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      placeholder="e.g., 3"
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_name">Course Name</Label>
                  <Input
                    id="course_name"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    placeholder="e.g., Data Structures and Algorithms"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <select
                      id="semester"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select semester</option>
                      <option value="Fall 2024">Fall 2024</option>
                      <option value="Spring 2025">Spring 2025</option>
                      <option value="Summer 2025">Summer 2025</option>
                      <option value="Fall 2025">Fall 2025</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor_id">Instructor</Label>
                    <select
                      id="instructor_id"
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No instructor assigned</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name} ({instructor.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <textarea
                    id="prerequisites"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    placeholder="e.g., CS201, MA101 (or leave empty if none)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingSubject ? 'Update' : 'Add')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No subjects added yet</p>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{subject.course_code} - {subject.course_name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{subject.semester}</span>
                    <span>{subject.credits} Credits</span>
                    <span>Instructor: {subject.instructor_name || 'Not assigned'}</span>
                  </div>
                  {subject.prerequisites && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Prerequisites: {subject.prerequisites}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(subject)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(subject.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectManagement;