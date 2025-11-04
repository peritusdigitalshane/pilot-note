import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, UserPlus, Trash2, Crown } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  description: string;
  created_by: string;
  member_count?: number;
  user_role?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

const Organizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    loadOrganizations(user.id);
  };

  const loadOrganizations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("organizations" as any)
        .select(`
          *,
          organization_members!inner (
            role
          )
        `);

      if (error) throw error;

      setOrganizations(data as any || []);
    } catch (error) {
      console.error("Error loading organisations:", error);
      toast.error("Failed to load organisations");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("organization_members" as any)
        .select(`
          *,
          profiles!inner (
            email
          )
        `)
        .eq("organization_id", orgId);

      if (error) throw error;

      const membersWithEmail = (data || []).map((m: any) => ({
        ...m,
        email: m.profiles?.email,
      }));

      setMembers(membersWithEmail);
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Organisation name is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations" as any)
        .insert({
          ...formData,
          created_by: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("organization_members" as any)
        .insert({
          organization_id: (org as any).id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success("Organisation created!");
      setDialogOpen(false);
      setFormData({ name: "", description: "" });
      loadOrganizations(user.id);
    } catch (error) {
      console.error("Error creating organisation:", error);
      toast.error("Failed to create organisation");
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg || !memberEmail) {
      toast.error("Please enter an email");
      return;
    }

    try {
      // Get user ID by email using secure function
      const { data: userId, error: userError } = await supabase
        .rpc("get_user_id_by_email", { _email: memberEmail });

      if (userError || !userId) {
        toast.error("User not found. They may need to sign up first.");
        return;
      }

      const { error } = await supabase
        .from("organization_members" as any)
        .insert({
          organization_id: selectedOrg.id,
          user_id: userId,
          role: 'member',
        });

      if (error) throw error;

      toast.success("Member added!");
      setMemberDialogOpen(false);
      setMemberEmail("");
      loadMembers(selectedOrg.id);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const { error } = await supabase
        .from("organization_members" as any)
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Member removed");
      if (selectedOrg) loadMembers(selectedOrg.id);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleOrgClick = (org: Organization) => {
    setSelectedOrg(org);
    loadMembers(org.id);
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Organisations</h1>
            <p className="text-sm text-muted-foreground">Manage your teams and share content with members</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Organisation
              </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Organisation</DialogTitle>
              <DialogDescription>
                Create a new organisation to share prompts with your team
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organisation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organisations List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Your Organisations</h2>
          {loading ? (
            <Card className="glass-card p-6">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : organizations.length === 0 ? (
            <Card className="glass-card p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No organisations yet</p>
            </Card>
          ) : (
            organizations.map((org) => (
              <Card
                key={org.id}
                className={`glass-card p-4 cursor-pointer hover-scale ${
                  selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleOrgClick(org)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{org.name}</h3>
                    {org.description && (
                      <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
                    )}
                  </div>
                  {org.user_role === 'admin' && (
                    <Badge variant="outline">
                      <Crown className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Members Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedOrg ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Members of {selectedOrg.name}</h2>
                <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member</DialogTitle>
                      <DialogDescription>
                        Enter the email of the user to add to this organisation
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-email">User Email</Label>
                        <Input
                          id="member-email"
                          type="email"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="user@example.com"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setMemberDialogOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleAddMember} className="flex-1">
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <Card key={member.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      {member.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="glass-card p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select an organisation to view members</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organizations;
