'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authAPI, societyAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Users as UsersIcon, Edit, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadData = async () => {
    try {
      const [usersRes, societiesRes] = await Promise.all([
        authAPI.getUsers(),
        societyAPI.getSocieties(),
      ]);

      const usersData = usersRes.data.results || usersRes.data || [];
      const usersArray = Array.isArray(usersData) ? usersData : [];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
      
      const societiesData = societiesRes.data.results || societiesRes.data || [];
      setSocieties(Array.isArray(societiesData) ? societiesData : []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load users data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const roleColors = {
    ADMIN: 'bg-purple-500/10 text-purple-500',
    COMMITTEE: 'bg-blue-500/10 text-blue-500',
    RESIDENT: 'bg-emerald-500/10 text-emerald-500',
    SECURITY: 'bg-orange-500/10 text-orange-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            Total Users: {users.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {users.filter((u) => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {users.filter((u) => u.role === 'COMMITTEE').length}
              </div>
              <div className="text-sm text-muted-foreground">Committee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {users.filter((u) => u.role === 'RESIDENT').length}
              </div>
              <div className="text-sm text-muted-foreground">Residents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {users.filter((u) => u.role === 'SECURITY').length}
              </div>
              <div className="text-sm text-muted-foreground">Security</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            roleColors[user.role as keyof typeof roleColors]
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.date_joined)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          societies={societies}
          onSuccess={() => {
            loadData();
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function EditUserDialog({ open, onClose, user, societies, onSuccess }: any) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    emergency_contact: user.emergency_contact || '',
    address: user.address || '',
    society: user.society || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      emergency_contact: user.emergency_contact || '',
      address: user.address || '',
      society: user.society || '',
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateUser(user.id, formData);
      toast({ title: 'Success', description: 'User updated successfully' });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border text-foreground rounded-lg p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            Edit User: {user.username}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="society">Society</Label>
                <select
                  id="society"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.society}
                  onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                >
                  <option value="">No Society</option>
                  {societies.map((society: any) => (
                    <option key={society.id} value={society.id}>
                      {society.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Username and Role cannot be changed. Current role:{' '}
                <span className="font-semibold text-foreground">{user.role}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

