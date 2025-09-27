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
  course_type: string;
  min_lab_hours: number;
  min_theory_hours: number;
  max_capacity: number;
  prerequisites: string;
  instructor_id: number | null;
  instructor_name: string | null;
}

interface Instructor {
  id: number;
  name: string;
  department: string;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
}

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    semester: '',
    credits: '',
    course_type: '',
    min_lab_hours: '',
    min_theory_hours: '',
    max_capacity: '',
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

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
    fetchCourses();
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
          course_type: formData.course_type,
          min_lab_hours: parseInt(formData.min_lab_hours) || 0,
          min_theory_hours: parseInt(formData.min_theory_hours) || 0,
          max_capacity: parseInt(formData.max_capacity),
          prerequisites: formData.prerequisites,
          instructor_id: formData.instructor_id ? parseInt(formData.instructor_id) : null
        })
      });

      if (response.ok) {
        fetchSubjects();
        setIsDialogOpen(false);
        setEditingSubject(null);
        setFormData({ course_code: '', course_name: '', semester: '', credits: '', course_type: '', min_lab_hours: '', min_theory_hours: '', max_capacity: '', prerequisites: '', instructor_id: '' });
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
      course_type: subject.course_type,
      min_lab_hours: subject.min_lab_hours.toString(),
      min_theory_hours: subject.min_theory_hours.toString(),
      max_capacity: subject.max_capacity.toString(),
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
    setFormData({ course_code: '', course_name: '', semester: '', credits: '', course_type: '', min_lab_hours: '', min_theory_hours: '', max_capacity: '', prerequisites: '', instructor_id: '' });
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
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course_type">Course Type</Label>
                    <select
                      id="course_type"
                      value={formData.course_type}
                      onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select course type</option>
                      <option value="Theory">Theory</option>
                      <option value="Lab">Lab</option>
                      <option value="Lab Cum Theory">Lab Cum Theory</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_lab_hours">Min Lab Hours</Label>
                    <Input
                      id="min_lab_hours"
                      type="number"
                      value={formData.min_lab_hours}
                      onChange={(e) => setFormData({ ...formData, min_lab_hours: e.target.value })}
                      placeholder="0"
                      min="0"
                      disabled={formData.course_type === 'Theory'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_theory_hours">Min Theory Hours</Label>
                    <Input
                      id="min_theory_hours"
                      type="number"
                      value={formData.min_theory_hours}
                      onChange={(e) => setFormData({ ...formData, min_theory_hours: e.target.value })}
                      placeholder="0"
                      min="0"
                      disabled={formData.course_type === 'Lab'}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_capacity">Max Capacity</Label>
                    <Input
                      id="max_capacity"
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                      placeholder="e.g., 50"
                      min="1"
                      required
                    />
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
                  <select
                    id="prerequisites"
                    multiple
                    value={formData.prerequisites ? formData.prerequisites.split(',').map(p => p.trim()) : []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, prerequisites: selected.join(', ') });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={4}
                  >
                    {courses.filter(course => course.id !== editingSubject?.id).map((course) => (
                      <option key={course.id} value={course.course_code}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple prerequisites</p>
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
                    <span>{subject.course_type}</span>
                    <span>Capacity: {subject.max_capacity}</span>
                    <span>Instructor: {subject.instructor_name || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {subject.min_lab_hours > 0 && <span>Lab Hours: {subject.min_lab_hours}</span>}
                    {subject.min_theory_hours > 0 && <span>Theory Hours: {subject.min_theory_hours}</span>}
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