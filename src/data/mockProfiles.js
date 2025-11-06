// src/data/mockProfiles.js

// A database of potential matches for the AI to reference when creating its JSON response.
export const MOCK_PROFILES = [
    // Matches suitable for a male user seeking female partners
    {
        id: 101,
        gender: "Female",
        name: "Priya Sharma",
        age: 29,
        occupation: "Data Scientist (Tech Lead)",
        city: "Bengaluru",
        religion: "Hindu",
        language: "Hindi",
        values: "Family-oriented, traditional but modern",
        interests: "Hiking, classical music, reading",
        summary: "A highly intellectual and family-oriented woman with a strong career. Values mutual respect and enjoys quiet weekends (hiking/reading)."
    },
    {
        id: 102,
        gender: "Female",
        name: "Neha Kulkarni",
        age: 27,
        occupation: "Entrepreneur (NGO Founder)",
        city: "Mumbai",
        religion: "Hindu",
        language: "Marathi",
        values: "Socially conscious, supportive of mission-driven life",
        interests: "Travel, social work, documentary films",
        summary: "Passionate about social work and travel. Looking for a partner who is supportive of her mission and has a good sense of humor."
    },
    {
        id: 103,
        gender: "Female",
        name: "Aisha Khan",
        age: 31,
        occupation: "Architect",
        city: "Dubai",
        religion: "Muslim",
        language: "Urdu",
        values: "Cosmopolitan lifestyle, cultural harmony",
        interests: "Modern art, gardening, fine dining",
        summary: "Creative and ambitious architect based in Dubai. Seeks a stable partner who appreciates culture and sophisticated experiences."
    },

    // Matches suitable for a female user seeking male partners
    {
        id: 201,
        gender: "Male",
        name: "Rahul Verma",
        age: 32,
        occupation: "Software Engineer (FAANG)",
        city: "San Francisco",
        religion: "Hindu",
        language: "Hindi",
        values: "Career growth, financially responsible, adventurous",
        interests: "Coding, skiing, fantasy novels",
        summary: "Settled in the US, Rahul is goal-oriented and adventurous. He seeks an intellectual equal to share his life and global travels with."
    },
    {
        id: 202,
        gender: "Male",
        name: "Arjun Reddy",
        age: 28,
        occupation: "Doctor (Cardiologist)",
        city: "Hyderabad",
        religion: "Hindu",
        language: "Telugu",
        values: "Respect for elders, health-focused, disciplined",
        interests: "Tennis, classical dance, volunteering at clinics",
        summary: "A dedicated cardiologist known for his calm demeanor. Looking for a compassionate partner who values discipline and family tradition."
    }
];