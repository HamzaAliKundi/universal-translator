import { translateText } from "./openai";
import { analyzeDocument } from "./documentAnalysis";
import { getDocumentByHash, saveDocument } from "../utils/api";

// Browser-compatible hashing function using Web Crypto API
async function generateTextHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text || "");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function processDocument(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  openaiKey: string
) {
  try {
    // Generate text hash
    const textHash = await generateTextHash(text);

    // // Check for existing document with same hash
    // const existingDoc = await getDocumentByHash(textHash);

    // if (existingDoc) {
    //   return {
    //     originalText: existingDoc.original_text,
    //     translatedText: existingDoc.translated_text,
    //     analysisResult: await analyzeDocument(text, openaiKey),
    //     confidenceScore: 0.8,
    //     documentId: existingDoc.id,
    //   };
    // }

    // First, analyze document using OpenAI
    const analysisResult = await analyzeDocument(text, openaiKey);

    // Use OpenAI for translation with context
    const translationPrompt = `
      Context and background information:
      ${analysisResult.summary}
      
      Original text to translate:
      ${text}
      
      Please provide a high-quality translation from ${sourceLanguage} to ${targetLanguage}, 
      taking into account the contextual information provided above.
    `;

    const translatedText = await translateText(
      translationPrompt,
      sourceLanguage,
      targetLanguage,
      openaiKey
    );

    // Save document to backend
    const docData = {
      name: `Translation_${new Date().toISOString()}`,
      size: new Blob([text]).size,
      type: "text/plain",
      original_text: text,
      translated_text: translatedText,
      image_url: "",
      text_hash: textHash,
    };

    console.log(docData);

    const savedDoc = await saveDocument(docData);

    console.log(savedDoc);

    return {
      originalText: text,
      translatedText,
      analysisResult,
      confidenceScore: 0.8,
      documentId: savedDoc?.document._id,
    };
  } catch (error) {
    console.error("Document processing error:", error);
    throw error;
  }
}
