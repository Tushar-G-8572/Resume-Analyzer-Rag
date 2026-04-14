import { config } from '../../config/config.js'
import { MistralAIEmbeddings } from '@langchain/mistralai'
import { Pinecone } from '@pinecone-database/pinecone'
import PDFParseLib from 'pdf-parse';
const PDFParse = PDFParseLib.default ?? PDFParseLib;

const embeddings = new MistralAIEmbeddings({
    apiKey: config.MISTRAL_API_KEY,
    model: "mistral-embed"
})

const pc = new Pinecone({
    apiKey: config.PINECONE_API_KEY,
})

// console.log("API key",pc);

const index = pc.index(config.PINECONE_INDEX);
// console.log("PINECONE_INDEX",index);
export async function generateEmbeddings(text) {
    const vector = await embeddings.embedQuery(text);
    return vector;
}

export function buildJobText(job) {
    return `
        Job Title: ${job.title}
        Company: ${job.company}
        Location: ${job.location}
        Description: ${job.description}
        Skills Required: ${job.skillsRequired.join(', ')}
        Experience Required: ${job.experienceRequired} years
    `.trim();
}

export async function storeJobEmbeddings(jobId, jobText, metaData = {}) {
    try {

        const vector = await generateEmbeddings(jobText);

        if (!vector || vector.length === 0) {
            throw new Error("Embedding generation failed - empty vector");
        }

        if (!Array.isArray(vector) || vector.length === 0) {
            throw new Error("Invalid embedding vector");
        }

        // console.log("Vector dimensions:", vector.length); // must be 1024
        // console.log("JobId", jobId);
        // console.log("JobMetaData", metaData);

        await index.upsert({
            records: [
                {
                    id: jobId.toString(),
                    values: vector,
                    metadata: {
                        jobId: jobId.toString(),
                        ...metaData
                    }
                }
            ]
        });
        return jobId.toString();
    } catch (err) {
        console.log(err);
    }
}

export async function parseResume(pdf) {
    try {
        const buffer = pdf.buffer;

        const data = await PDFParse(buffer); // ✅ call directly with buffer
        // console.log("Parsed text:", data.text);

        return data.text;

    } catch (err) {
        console.error("PDF parsing error:", err);
        throw err;
    }
}

export async function matchJob(pdfData, jobEmbeddingId) {

    const resumeVector = await generateEmbeddings(pdfData.join(" "));

    const result = await index.query({
        id: jobEmbeddingId,
        topK: 1,
        includeValues: true
    })

    if (!result.matches || result.matches.length === 0) { // ✅ fixed key
        throw new Error("Job embedding not found in vector DB");
    }

    const queryResult = await index.query({
        vector: resumeVector,
        topK: 10,
        filter: { jobId: { $eq: jobEmbeddingId } },
        includeMetadata: true
    })

    const match = queryResult.matches.find(m => m.id === jobEmbeddingId);
    return match ? match.score : 0;
}

export async function findTopJobsForResume(pdfData, topK = 10) {
    const resumeVector = await generateEmbeddings(pdfData);

    const result = await index.query({
        vector: resumeVector,
        topK,
        includeMetadata: true,
        filter: { status: { $eq: "open" } }
    });

    return result.matches.map(match => ({
        jobId: match.metadata.jobId,
        score: match.score,
        title: match.metadata.title,
        company: match.metadata.company
    }));
}