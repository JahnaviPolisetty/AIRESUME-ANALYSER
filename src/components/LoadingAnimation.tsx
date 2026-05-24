import { Loader2, FileSearch } from "lucide-react";

export const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="w-20 h-20 rounded-full bg-primary/20"></div>
        </div>
        <div className="relative p-6 bg-gradient-primary rounded-full">
          <FileSearch className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-lg font-semibold">Analyzing Resume</p>
        </div>
        <p className="text-sm text-muted-foreground">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};
