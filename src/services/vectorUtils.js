// Calculates the cosine similarity between two vectors.
//Used when Hugging Face Token is necessary now primarily the geminiApi is used for strength score and data retrieval.
//It's not used in the current main flow but kept for potential future use cases.
export const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
};