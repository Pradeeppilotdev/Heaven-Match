export const enrichProfileWithAI = async (basicProfile) => {
    // Here we have main 5 things to be generated: profession, income, location, age range, hobbies, education.
    const schema = {
        type: "object",
        properties: {
            profession: { type: "string", description: "A realistic and professional job title (e.g., Software Engineer, Doctor)." },
            income_lpa: { type: "string", description: "A realistic income range in Lakhs per Annum (e.g., 10-15 LPA or 20-30 LPA)." },
            location: { type: "string", description: "A specific city or region (e.g., Mumbai, Bangalore)." },
            age_range: { type: "string", description: "An age range based on the input age (e.g., 25-30)." },
            hobbies: { type: "array", items: { type: "string" }, description: "3 realistic hobbies or interests, including sports (e.g., hiking, cricket, reading)." },
            education: { type: "string", description: "Highest educational qualification (e.g., B.Tech, MBA, PhD)." }
        },
        required: ["profession", "income_lpa", "location", "age_range", "hobbies", "education"]
    };

    // Generate age range from basicProfile.age
    const age = parseInt(basicProfile.age, 10);
    const ageRange = isNaN(age) ? "25-30" : `${Math.max(18, age - 2)}-${age + 2}`; // Default to 25-30 if age is invalid

    const prompt = `
        You are an AI Profile Generator for a matrimonial service.
        Generate realistic, structured data to enrich the following basic profile.
        Make the data suitable for a sophisticated, modern professional.
        Ensure the age range is consistent with the provided age, and hobbies include sports.
        
        Profile Details:
        - Name: ${basicProfile.name}
        - Age: ${basicProfile.age} (use this to generate an age range like ${ageRange})
        - Location: ${basicProfile.location}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            },
        });

        const enrichedData = JSON.parse(response.text);
        return enrichedData;

    } catch (error) {
        console.error("AI Profile Enrichment Error:", error);
        return null;
    }
};