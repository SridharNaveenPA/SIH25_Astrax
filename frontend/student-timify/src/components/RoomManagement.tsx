import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus } from "lucide-react";

interface Room {
  id: number;
  room_id: string;
  building: string;
  capacity: number;
  room_type: string;
}

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_id: '',
    building: '',
    capacity: '',
    room_type: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingRoom 
        ? `http://localhost:4000/api/admin/rooms/${editingRoom.id}`
        : 'http://localhost:4000/api/admin/rooms';
      
      const method = editingRoom ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: formData.room_id,
          building: formData.building,
          capacity: parseInt(formData.capacity),
          room_type: formData.room_type
        })
      });

      if (response.ok) {
        fetchRooms();
        setIsDialogOpen(false);
        setEditingRoom(null);
        setFormData({ room_id: '', building: '', capacity: '', room_type: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save room');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_id: room.room_id,
      building: room.building,
      capacity: room.capacity.toString(),
      room_type: room.room_type
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/rooms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const openAddDialog = () => {
    setEditingRoom(null);
    setFormData({ room_id: '', building: '', capacity: '', room_type: '' });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Room Management</CardTitle>
            <CardDescription>Manage classroom availability and capacity</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                <DialogDescription>
                  {editingRoom ? 'Update room details' : 'Add a new room to the system'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room_id">Room ID</Label>
                  <Input
                    id="room_id"
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    placeholder="e.g., A101, Lab-1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    placeholder="e.g., Main Building, Science Block"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 50"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type</Label>
                  <select
                    id="room_type"
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select room type</option>
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingRoom ? 'Update' : 'Add')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rooms added yet</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{room.room_id}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{room.building}</span>
                    <span>Capacity: {room.capacity}</span>
                    <span>{room.room_type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(room.id)}>
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

export default RoomManagement;
