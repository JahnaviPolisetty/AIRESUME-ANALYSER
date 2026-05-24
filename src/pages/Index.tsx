import { useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { ResumeUploader } from "@/components/ResumeUploader";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker using Vite's import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface AnalysisResult {
  score: number;
  summary: string;
  recommendations?: string[];
}

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "jobseeker">("recruiter");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload a resume and provide a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      // Extract text from PDF
      toast({
        title: "Processing Resume",
        description: "Extracting text from PDF...",
      });
      
      const resumeText = await extractTextFromPDF(selectedFile);

      if (!resumeText.trim()) {
        throw new Error("Could not extract text from PDF. Please ensure the file is not encrypted.");
      }

      // Call backend function
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: {
          resumeText,
          jobDescription,
          userType: selectedRole,
        },
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobDescription("");
    setResults(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b bg-gradient-to-r from-primary via-primary-light to-accent">
        <div className="container relative mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <svg className="w-9 h-9 text-[#61dafb] animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ATS Resume Analyzer
            </h1>
          </div>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Leverage AI to match resumes with job descriptions and get instant feedback
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        {/* Role Selection */}
        <div className="flex justify-center mb-8">
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>

        {/* Input Section */}
        <Card className="mb-8 shadow-elegant border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Upload & Analyze</CardTitle>
            <CardDescription>
              {selectedRole === "recruiter"
                ? "Evaluate candidate resumes against your job requirements"
                : "Get personalized recommendations to improve your resume"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResumeUploader
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClear={() => setSelectedFile(null)}
            />
            
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || !jobDescription.trim() || isAnalyzing}
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12"
                size="lg"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && <LoadingAnimation />}

        {/* Results Section */}
        {results && !isAnalyzing && (
          <ResultsDisplay
            score={results.score}
            summary={results.summary}
            recommendations={results.recommendations}
            userType={selectedRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-md py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            ATS Resume Analyzer is a student major project built with a modern developer stack:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* React Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-default">
              <svg className="w-4 h-4 animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
              React
            </span>

            {/* Vite Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all cursor-default">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 4.25l6.5 13H5.5L12 6.25z" />
              </svg>
              Vite
            </span>

            {/* Supabase Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-default">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 12h5v10l8-10h-5V2z" />
              </svg>
              Supabase
            </span>

            {/* Shadcn UI Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-foreground/10 text-foreground border border-foreground/20 hover:bg-foreground/20 transition-all cursor-default">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Shadcn UI
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-6">
            &copy; {new Date().getFullYear()} ATS Resume Analyzer &bull; Developed by Jahnavi Polisetty &bull; AITS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
