import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, userType } = await req.json();
    console.log("Analyzing resume for user type:", userType);

    const AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI Gateway API Key is not configured");
    }

    // Prepare prompts based on user type
    const systemPrompt = userType === "recruiter"
      ? "You are an expert ATS (Applicant Tracking System) that helps recruiters evaluate candidates. Analyze resumes objectively and provide actionable insights."
      : "You are a helpful career advisor that helps job seekers improve their resumes. Provide constructive feedback and actionable recommendations.";

    const analysisPrompt = `
Job Description:
${jobDescription}

Resume Content:
${resumeText}

Please analyze this resume against the job description and provide:
1. A match score from 0-100 (consider skills, experience, keywords, qualifications)
2. A concise 2-3 sentence summary of the candidate's profile
${userType === "jobseeker" ? "3. 3-5 specific recommendations to improve the resume for this role" : ""}

Format your response as JSON with this structure:
{
  "score": <number 0-100>,
  "summary": "<string>",
  ${userType === "jobseeker" ? '"recommendations": ["<string>", "<string>", ...]' : ''}
}
`;

    console.log("Calling AI Gateway...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please verify your AI API key and workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const aiContent = data.choices[0].message.content;
    const result = JSON.parse(aiContent);

    return new Response(
      JSON.stringify({
        score: result.score,
        summary: result.summary,
        recommendations: result.recommendations || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
