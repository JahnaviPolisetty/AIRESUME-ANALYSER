import { Button } from "@/components/ui/button";
import { Users, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: "recruiter" | "jobseeker";
  onRoleChange: (role: "recruiter" | "jobseeker") => void;
}

export const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="flex gap-4 p-1 bg-muted rounded-lg w-full max-w-md">
      <Button
        variant={selectedRole === "recruiter" ? "default" : "ghost"}
        className="flex-1 gap-2"
        onClick={() => onRoleChange("recruiter")}
      >
        <Briefcase className="w-4 h-4" />
        Recruiter
      </Button>
      <Button
        variant={selectedRole === "jobseeker" ? "default" : "ghost"}
        className="flex-1 gap-2"
        onClick={() => onRoleChange("jobseeker")}
      >
        <Users className="w-4 h-4" />
        Job Seeker
      </Button>
    </div>
  );
};
