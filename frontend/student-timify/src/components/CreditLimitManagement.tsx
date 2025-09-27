import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save } from "lucide-react";

interface CreditLimit {
  id: number;
  semester_number: number;
  max_credits: number;
}

const CreditLimitManagement = () => {
  const [creditLimits, setCreditLimits] = useState<CreditLimit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<CreditLimit | null>(null);
  const [formData, setFormData] = useState({
    max_credits: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchCreditLimits = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/credit-limits');
      const data = await response.json();
      setCreditLimits(data);
    } catch (error) {
      console.error('Error fetching credit limits:', error);
    }
  };

  useEffect(() => {
    fetchCreditLimits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/credit-limits/${editingSemester?.semester_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_credits: parseInt(formData.max_credits)
        })
      });

      if (response.ok) {
        fetchCreditLimits();
        setIsDialogOpen(false);
        setEditingSemester(null);
        setFormData({ max_credits: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update credit limit');
      }
    } catch (error) {
      console.error('Error updating credit limit:', error);
      alert('Failed to update credit limit');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (creditLimit: CreditLimit) => {
    setEditingSemester(creditLimit);
    setFormData({
      max_credits: creditLimit.max_credits.toString()
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Credit Limit Management</CardTitle>
            <CardDescription>Set maximum credits allowed per semester</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creditLimits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No credit limits found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditLimits.map((creditLimit) => (
                <div key={creditLimit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Semester {creditLimit.semester_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      Max Credits: {creditLimit.max_credits}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(creditLimit)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Credit Limit</DialogTitle>
              <DialogDescription>
                Update the maximum credits allowed for Semester {editingSemester?.semester_number}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max_credits">Maximum Credits</Label>
                <Input
                  id="max_credits"
                  type="number"
                  value={formData.max_credits}
                  onChange={(e) => setFormData({ ...formData, max_credits: e.target.value })}
                  placeholder="e.g., 24"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CreditLimitManagement;
