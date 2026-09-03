import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, UserCheck, UserX, Search, Shield, AlertTriangle, Eye, CheckCircle, Clock, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  approved: boolean;
  approved_at: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "customer" | "provider" | "pending">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("admin");
    checkAdminAccess();
    fetchUsers();
    fetchProfile();
  }, [setTheme]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);
  };

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      navigate("/auth/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles = profilesData?.map(profile => {
        const userRole = rolesData?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "unknown"
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true, approved_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`${userName} has been approved`);
      fetchUsers();
      setViewDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to approve user");
    }
  };

  const handleUnapproveUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unapprove ${userName}?`)) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: false, approved_at: null })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`${userName} has been unapproved`);
      fetchUsers();
      setViewDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to unapprove user");
    }
  };

  const handleSuspendUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to suspend ${userName}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: false, approved_at: null })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${userName} has been suspended (unapproved)`);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to suspend user");
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) return;

    try {
      // Delete from user_roles first (foreign key constraint)
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Delete from profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success(`User ${userName} removed successfully`);
      fetchUsers();
      setViewDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to remove user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === "pending") {
      matchesFilter = !user.approved;
    } else if (filter !== "all") {
      matchesFilter = user.role === filter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalUsers: users.length,
    customers: users.filter(u => u.role === "customer").length,
    providers: users.filter(u => u.role === "provider").length,
    pending: users.filter(u => !u.approved).length,
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-secondary" />
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Manage users and platform activities</p>
          </div>
          <Link to="/dashboard/profile">
            <Button variant="ghost" size="icon" className="relative">
              {profile ? (
                <UserAvatar avatarUrl={profile.avatar_url} fullName={profile.full_name} />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
              <p className="text-xs text-muted-foreground">Active customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.providers}</div>
              <p className="text-xs text-muted-foreground">Service providers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "customer" ? "default" : "outline"}
                  onClick={() => setFilter("customer")}
                  size="sm"
                >
                  Customers
                </Button>
                <Button
                  variant={filter === "provider" ? "default" : "outline"}
                  onClick={() => setFilter("provider")}
                  size="sm"
                >
                  Providers
                </Button>
              </div>
            </div>

            {/* Users List */}
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge variant={user.role === "provider" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        {user.approved ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id, user.full_name)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id, user.full_name)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Review user information and manage approval status
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{selectedUser.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge variant={selectedUser.role === "provider" ? "default" : "secondary"}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {selectedUser.approved ? (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Joined</label>
                <p>{new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              {selectedUser.approved_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Approved On</label>
                  <p>{new Date(selectedUser.approved_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedUser.approved ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUnapproveUser(selectedUser.id, selectedUser.full_name)}
                  >
                    Unapprove User
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => handleApproveUser(selectedUser.id, selectedUser.full_name)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
