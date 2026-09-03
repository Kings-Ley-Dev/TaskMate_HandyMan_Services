import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access this page");
        navigate("/auth/login");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || !roleData) {
        toast.error("Unable to verify user role");
        navigate("/");
        return;
      }

      if (!allowedRoles.includes(roleData.role)) {
        toast.error("You don't have permission to access this page");
        
        // Redirect based on user's actual role
        if (roleData.role === "customer") {
          navigate("/dashboard/customer");
        } else if (roleData.role === "provider") {
          navigate("/dashboard/provider");
        } else if (roleData.role === "admin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/");
        }
        return;
      }

      // Check approval status for providers
      if (roleData.role === "provider") {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("approved")
          .eq("id", user.id)
          .single();

        if (profileData && !profileData.approved) {
          toast.error("Your account is pending approval");
          navigate("/");
          return;
        }
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Access check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
