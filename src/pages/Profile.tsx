import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Crown, CreditCard, Mail, Calendar, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        navigate("/auth");
        return;
      }

      setUser(authUser);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isPremium = profile?.is_premium_member || false;

  const freePlanFeatures = [
    "Access to Base Model",
    "5 conversations per day",
    "Basic knowledge base",
    "Standard support",
  ];

  const premiumFeatures = [
    "Unlimited AI conversations",
    "Unlimited custom AI models",
    "Unlimited knowledge bases with RAG",
    "Unlimited voice transcriptions",
    "Unlimited notes storage",
    "Priority support",
    "Access to all premium prompt packs",
    "Organisation sharing & collaboration",
    "Advanced analytics & insights",
    "API access",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text">My Account</h1>
          <p className="text-muted-foreground">Manage your subscription and account settings</p>
        </div>

        {/* Current Plan Card */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isPremium 
                    ? "You have full access to all premium features" 
                    : "You're on the free plan with limited features"
                  }
                </CardDescription>
              </div>
              {isPremium ? (
                <CreditCard className="h-8 w-8 text-primary" />
              ) : (
                <Button 
                  onClick={handleUpgrade} 
                  disabled={upgrading}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  {upgrading ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {isPremium ? "Premium Features" : "Free Plan Features"}
                  </h3>
                  <ul className="space-y-2">
                    {(isPremium ? premiumFeatures : freePlanFeatures).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isPremium && (
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border border-primary/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      Upgrade to Premium
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get unlimited access to all features for just <span className="text-lg font-bold text-primary">$29/month</span>
                    </p>
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={upgrading}
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      {upgrading ? "Processing..." : "Get Premium Now"}
                    </Button>
                  </div>
                )}
              </div>

              {isPremium && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Thank you for being a Premium member!</strong> You have unlimited access to all features.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{user?.id.slice(0, 20)}...</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSignOut} className="flex-1">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
