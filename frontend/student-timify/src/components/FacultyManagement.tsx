import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus } from "lucide-react";

interface Faculty {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  max_hours_per_week: number;
  availability: any;
  username: string;
  user_email: string;
}

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password_hash: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    max_hours_per_week: '40'
  });
  const [loading, setLoading] = useState(false);

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/faculty');
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingFaculty 
        ? `http://localhost:4000/api/admin/faculty/${editingFaculty.id}`
        : 'http://localhost:4000/api/admin/faculty';
      
      const method = editingFaculty ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password_hash: formData.password_hash,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          max_hours_per_week: parseInt(formData.max_hours_per_week),
          availability: {
            monday: { start: "09:00", end: "17:00", available: true },
            tuesday: { start: "09:00", end: "17:00", available: true },
            wednesday: { start: "09:00", end: "17:00", available: true },
            thursday: { start: "09:00", end: "17:00", available: true },
            friday: { start: "09:00", end: "17:00", available: true },
            saturday: { start: "09:00", end: "13:00", available: false },
            sunday: { start: "09:00", end: "13:00", available: false }
          }
        })
      });

      if (response.ok) {
        fetchFaculty();
        setIsDialogOpen(false);
        setEditingFaculty(null);
        setFormData({ username: '', password_hash: '', name: '', email: '', phone: '', department: '', max_hours_per_week: '40' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save faculty');
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Failed to save faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facultyMember: Faculty) => {
    setEditingFaculty(facultyMember);
    setFormData({
      username: facultyMember.username,
      password_hash: '', // Don't show password for editing
      name: facultyMember.name,
      email: facultyMember.email,
      phone: facultyMember.phone,
      department: facultyMember.department,
      max_hours_per_week: facultyMember.max_hours_per_week.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this faculty member? This will also delete their user account.')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/faculty/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchFaculty();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty');
    }
  };

  const openAddDialog = () => {
    setEditingFaculty(null);
    setFormData({ username: '', password_hash: '', name: '', email: '', phone: '', department: '', max_hours_per_week: '40' });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Faculty Management</CardTitle>
            <CardDescription>Manage faculty members and their subject assignments</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                <DialogDescription>
                  {editingFaculty ? 'Update faculty details' : 'Add a new faculty member to the system'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g., john.doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_hash">Password</Label>
                    <Input
                      id="password_hash"
                      type="password"
                      value={formData.password_hash}
                      onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                      placeholder="Enter password"
                      required={!editingFaculty}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dr. John Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g., john.doe@university.edu"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., +1-555-0123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_hours_per_week">Max Hours/Week</Label>
                    <Input
                      id="max_hours_per_week"
                      type="number"
                      value={formData.max_hours_per_week}
                      onChange={(e) => setFormData({ ...formData, max_hours_per_week: e.target.value })}
                      placeholder="40"
                      min="1"
                      max="60"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingFaculty ? 'Update' : 'Add')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faculty.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No faculty members added yet</p>
          ) : (
            faculty.map((facultyMember) => (
              <div key={facultyMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{facultyMember.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>@{facultyMember.username}</span>
                    <span>{facultyMember.department}</span>
                    <span>{facultyMember.email}</span>
                    <span>Max: {facultyMember.max_hours_per_week}h/week</span>
                  </div>
                  {facultyMember.phone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Phone: {facultyMember.phone}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(facultyMember)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(facultyMember.id)}>
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

export default FacultyManagement;
