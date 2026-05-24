import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobDescriptionInput = ({ value, onChange }: JobDescriptionInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="jobDescription" className="text-base font-semibold">
        Job Description
      </Label>
      <Textarea
        id="jobDescription"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] resize-none border-border focus:border-primary transition-colors"
      />
      <p className="text-xs text-muted-foreground">
        Include key requirements, skills, and qualifications
      </p>
    </div>
  );
};
