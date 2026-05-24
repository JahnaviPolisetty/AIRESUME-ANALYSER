import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularScore } from "./CircularScore";
import { FileText, Lightbulb, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResultsDisplayProps {
  score: number;
  summary: string;
  recommendations?: string[];
  userType: "recruiter" | "jobseeker";
}

export const ResultsDisplay = ({ score, summary, recommendations, userType }: ResultsDisplayProps) => {
  const getMatchLevel = (score: number) => {
    if (score >= 70) return { label: "Excellent Match", color: "bg-success" };
    if (score >= 40) return { label: "Good Match", color: "bg-warning" };
    return { label: "Needs Improvement", color: "bg-destructive" };
  };

  const matchLevel = getMatchLevel(score);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Card */}
      <Card className="overflow-hidden border-2 shadow-elegant">
        <div className="bg-gradient-hero p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl text-primary-foreground flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge className={`${matchLevel.color} text-white`}>
                {matchLevel.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-center">
            <CircularScore score={score} animate={true} />
          </CardContent>
        </div>
      </Card>

      {/* Summary Card */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Resume Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Recommendations Card - Only for job seekers */}
      {userType === "jobseeker" && recommendations && recommendations.length > 0 && (
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="w-5 h-5 text-accent" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
