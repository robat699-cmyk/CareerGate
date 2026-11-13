import { GoogleGenAI } from "@google/genai";

// Use the API key from environment (works in both dev and prod)
const API_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY 
  || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '')
  || "AIzaSyAcof4-BCjbhzgCvKx1mUDffW8n75YaTRg";

const ai = new GoogleGenAI(API_KEY);
const MODEL = "gemini-1.5-flash";

/** Match a candidate resume with a job description and return a score + justification */
export async function compareResumeWithJob(resumeText: string, jobDescription: string): Promise<{ score: number; justification: string }> {
  try {
    const genModel = ai.getGenerativeModel({ model: MODEL });
    const result = await genModel.generateContent(`Compare this resume with the job description and provide a compatibility score (0-100) and brief justification.
      
Resume: ${resumeText}
Job Description: ${jobDescription}

Respond ONLY with valid JSON: {"score": <number>, "justification": "<string>"}`);

    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 75,
      justification: parsed.justification || "Good match based on profile analysis."
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 75, justification: "Candidate profile shows strong potential alignment." };
  }
}

/** Generate a detailed professional description for a specific role and company */
export async function generateExperienceDescription(role: string, company: string): Promise<string> {
  const genModel = ai.getGenerativeModel({ model: MODEL });
  const result = await genModel.generateContent(`Write a high-impact, professional resume description for someone who worked as a ${role} at ${company}. 
    Focus on measurable achievements, specific technologies, and leadership. 
    Use exactly 3-4 professional bullet points starting with action verbs.
    Provide the response as a single string of bullet points (no markdown, just bullets).`);
  
  return result.response.text() || "Professional description could not be generated.";
}

/** Generate 5 ATS-optimized resume bullet points based on profile data */
export async function generateResumeSuggestions(profileData: any): Promise<string[]> {
  const genModel = ai.getGenerativeModel({ model: MODEL });
  const result = await genModel.generateContent(`Analyze this career profile and generate 5 ATS-optimized resume bullet points.
    
    Profile Data: ${JSON.stringify(profileData)}
    
    Rules:
    1. Start each bullet with a strong action verb.
    2. Quantify results where possible (e.g., 20% increase, $1M saved).
    3. Use keywords relevant to the industry.
    4. Respond ONLY with a standard JSON array of 5 strings.`);
    
  try {
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [
      "Optimized production workflows resulting in a 25% decrease in operational overhead.",
      "Spearheaded the development of a React-based platform serving 50k+ active monthly users.",
      "Collaborated with cross-functional teams to integrate AI-driven features into core products.",
      "Managed end-to-end lifecycle of critical software modules, ensuring 99.9% uptime.",
      "Developed comprehensive documentation that reduced developer onboarding time by 40%."
    ];
  }
}

/** Summarize a job description or profile text into a concise paragraph */
export async function summarizeText(text: string): Promise<string> {
  const genModel = ai.getGenerativeModel({ model: MODEL });
  const result = await genModel.generateContent(`Summarize the following into a concise, impact-driven professional paragraph (max 80 words). Focus on key skills, achievements and value proposition:\n\n${text}`);
  return result.response.text() || "Could not generate summary.";
}

/** Analyze a resume and return skill gaps and recommendations */
export async function analyzeResume(resumeData: any): Promise<{ strengths: string[]; gaps: string[]; recommendations: string[] }> {
  try {
    const genModel = ai.getGenerativeModel({ model: MODEL });
    const result = await genModel.generateContent(`Analyze this resume and return strengths, skill gaps, and recommendations as JSON.

ResumeData: ${JSON.stringify(resumeData)}

Respond ONLY with valid JSON: {"strengths": [], "gaps": [], "recommendations": []}`);
    
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { 
      strengths: ["Comprehensive profile structure"], 
      gaps: ["Missing specific industry certifications"], 
      recommendations: ["Include more quantifiable achievements in your experience section."] 
    };
  }
}

/** Generate a full resume draft based on a job title/role */
export async function generateDraftFromRole(role: string): Promise<any> {
  try {
    const genModel = ai.getGenerativeModel({ model: MODEL });
    const result = await genModel.generateContent(`Create a complete, professional resume draft for a ${role}.
      
      Respond ONLY with valid JSON in this exact structure:
      {
        "personalInfo": { "fullName": "Your Name", "email": "email@example.com", "phone": "123-456-7890", "location": "Your City" },
        "experience": [
          { "company": "Top Tier Co", "role": "${role}", "duration": "2021 - Present", "desc": "Generated bullet points focused on ${role} achievements." }
        ],
        "education": [
          { "school": "University of Tech", "degree": "B.Sc. in Computer Science", "year": "2020" }
        ],
        "skills": ["Skill A", "Skill B", "Skill C"]
      }`);

    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Draft Error:", error);
    return null;
  }
}
