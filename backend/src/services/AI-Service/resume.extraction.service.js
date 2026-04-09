import {config} from '../../config/config.js'
import { ChatMistralAI } from '@langchain/mistralai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const mistralModel = new ChatMistralAI({
    model: 'mistral-small-latest',
    apiKey: config.MISTRAL_API_KEY,
})

export async function extractionResumeData(resumeText) {
    const response = await mistralModel.invoke([
        new SystemMessage(`You are a resume parser. Extract structured information from resume text.
Always return ONLY a valid JSON object — no explanation, no markdown, no backticks.`),

        new HumanMessage(`Extract the following from this resume and return as JSON:
{
  "name": "candidate full name or null",
  "skills": ["skill1", "skill2"],
  "experienceYears": 0,
  "educationLevel": "Bachelor/Master/PhD/Other/null",
  "jobTitles": ["previous title 1", "previous title 2"],
  "summary": "2 line professional summary based on resume"
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