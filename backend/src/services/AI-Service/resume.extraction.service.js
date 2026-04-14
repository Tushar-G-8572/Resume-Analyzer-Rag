import { config } from '../../config/config.js'
import { ChatMistralAI } from '@langchain/mistralai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const mistralModel = new ChatMistralAI({
    model: 'mistral-small-latest',
    apiKey: config.MISTRAL_API_KEY,
})

export async function extractionResumeData(resumeText) {
    const response = await mistralModel.invoke([
        new SystemMessage(`You are a resume parser. Extract structured information from resume text and create summary based on resume .
Always return ONLY a valid JSON object — no explanation, no markdown, no backticks.`),

        new HumanMessage(`Extract the following from this resume and return as JSON:
{
  "name": "candidate full name or null",
  "skills": ["skill1", "skill2"],
  "experienceYears": 0,
  "educationLevel": "Bachelor/Master/PhD/Other/null with field  or null",
  "jobTitles": ["previous title 1", "previous title 2"],
  "summary": "you have to create a Summary of  2-3 line professional summary based on resume which defines the candidate"
}

Resume Text:
${resumeText}`)
    ])

    const raw = response.content
    const clean = raw.replace(/```json|```/g, "").trim()

    try {
        return JSON.parse(clean)
    } catch (err) {
        console.error("Failed to parse Mistral response:", raw)
        throw new Error("Resume extraction failed — invalid JSON from Mistral")
    }

}

export async function compareCandidateAndRecrutor(pdfData, jobData) {
    // console.log(pdfData, jobData)
    const response = await mistralModel.invoke([
        new SystemMessage(`You are a job matching assistant. Compare the candidate's resume with the job data and match skills also and provide a match skills,missing skills,experience gap, along with your feedback. STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No backticks
- No extra text

Output format:
{
  "matchSkills": [],
  "missingSkills": [],
  "experienceGap": "",
  "feedback": ""
} `),
        new HumanMessage(`
Compare the candidate resume with job description and provide the following as JSON:

{
    "matchSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "experienceGap": "2 years less experience than required",
    "feedback": "Overall feedback on candidate's fit for the job based on resume and job description"
}

Candidate Resume:
${pdfData}

Job Data:
${JSON.stringify(jobData, null, 2)}
`)
    ])
    const raw = response.content
    const clean = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(clean);
    } catch (err) {
        console.error("❌ Invalid JSON:", raw);
        throw new Error("Candidate comparison failed");
    }

}