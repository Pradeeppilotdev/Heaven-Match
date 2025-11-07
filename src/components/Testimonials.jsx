import React, { useState, useEffect, useRef } from 'react';
// Import icons for UI elements, navigation, ratings, and content generation.
import { Quote, Star, User, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';


// Simple wrapper component for consistent styling and hover effects.
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-pink-100 p-6 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

/**
 * Renders an individual testimonial card.
 * @param {Object} props - Component props.
 * @param {Object} props.testimonial - The testimonial data object (story, name, location, imageQuery).
 * @param {number} props.index - The global index used to ensure unique placeholder images.
 */
const TestimonialCard = ({ testimonial, index }) => {
    // State to handle fallback if the random Unsplash image fails to load.
    const [imageError, setImageError] = useState(false);

    return (
        <Card className="hover:shadow-2xl hover:shadow-pink-300/50 transform hover:scale-[1.02] transition duration-300 ease-in-out">
            <div className="space-y-4">
                <Quote className="w-10 h-10 text-pink-300" />
                {/* 5-star rating display */}
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-pink-500 text-pink-500" />
                    ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.story}"</p>
                
                {/* Couple profile section */}
                <div className="flex items-center gap-4 pt-4 border-t border-pink-100">
                    <div className="w-12 h-12 rounded-full flex-shrink-0">
                        {imageError ? (
                            // Fallback UI if image loading fails (e.g., Unsplash error).
                            <div className="w-full h-full rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-200">
                                <User className="w-6 h-6 text-pink-500" />
                            </div>
                        ) : (
                            <img
                                // Generates a random image based on the AI-provided query. 't' parameter forces refresh.
                                src={`https://source.unsplash.com/random/400x400/?${encodeURIComponent(testimonial.imageQuery)}&t=${index}`}
                                alt={testimonial.coupleName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                                onError={() => setImageError(true)} // Sets error state on failure.
                            />
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-pink-600">{testimonial.coupleName}</div>
                        <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Main Testimonials section component. Fetches structured success stories from the Gemini API 
 * and displays them in a paginated carousel/grid.
 */
export const Testimonials = () => {
    // State to track the currently visible group of testimonials (0, 1, or 2).
    const [currentIndex, setCurrentIndex] = useState(0);
    // State holding the array of 9 generated testimonial objects.
    const [displayedTestimonials, setDisplayedTestimonials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Flag to manage initial loading state vs. subsequent reloads.
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const STORIES_PER_PAGE = 3;
    const TOTAL_PAGES = 3;
    const TOTAL_DISPLAYED = STORIES_PER_PAGE * TOTAL_PAGES; // Total of 9 stories requested from the API.
    
    /**
     * Calls the Gemini API to generate a structured JSON array of unique success stories.
     */
    const generateTestimonials = async () => {
        setLoading(true);
        setError(null);

        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        // Configuration check with local fallback
        if (!apiKey) {
            const local = Array.from({ length: TOTAL_DISPLAYED }).map((_, i) => ({
                coupleName: `Aarav & Meera ${i+1}`,
                location: "Mumbai, Maharashtra",
                story: "Heaven Match's compatibility score helped us skip the guesswork and focus on what matters.",
                imageQuery: "indian couple"
            }));
            setDisplayedTestimonials(local);
            setCurrentIndex(0);
            setIsInitialLoad(false);
            setLoading(false);
            return;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
        
        // Detailed prompt requiring 9 unique stories with specific formatting and content diversity.
        const prompt = `
You are creating success stories for "Heaven Match", an AI-powered Indian dating platform.

Generate exactly 9 unique and heartwarming success stories of couples who found love through Heaven Match.

Each story should include:
1. coupleName: Two Indian first names (diverse, representing different regions)
2. location: A city in India with state (e.g., "Mumbai, Maharashtra")
3. story: A 2-3 sentence testimonial about how Heaven Match's AI helped them find love. Mention specific AI features like compatibility scores, personality matching, shared interests detection, etc.
4. imageQuery: A 2-4 word search term for couple photos (e.g., "happy indian couple", "traditional wedding couple", "couple outdoors")

Make the stories diverse in:
- Age groups (young professionals, mature couples, etc.)
- Interests (travel, food, career, family, hobbies, arts, sports, etc.)
- How they met (long distance, same city, personality match, shared values, etc.)
- Regions of India

Keep stories genuine, warm, and family-friendly. Focus on emotional connections and how AI made the match possible.
        `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                // Strict schema definition to ensure reliable JSON parsing of the 9 objects.
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            coupleName: { type: "STRING" },
                            location: { type: "STRING" },
                            story: { type: "STRING" },
                            imageQuery: { type: "STRING" }
                        },
                        required: ["coupleName", "location", "story", "imageQuery"]
                    }
                }
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const jsonText = result.candidates[0].content.parts[0].text;
            const parsedTestimonials = JSON.parse(jsonText);
            
            // Slice the result to ensure only the expected number of stories is displayed.
            if (parsedTestimonials.length >= TOTAL_DISPLAYED) {
                setDisplayedTestimonials(parsedTestimonials.slice(0, TOTAL_DISPLAYED));
            } else {
                setDisplayedTestimonials(parsedTestimonials);
            }
            
            setCurrentIndex(0); // Reset to the first page on new data load.
            setIsInitialLoad(false);

        } catch (err) {
            console.error("Failed to generate testimonials:", err);
            setError("Unable to load success stories. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount.
    useEffect(() => {
        generateTestimonials();
    }, []);
    
    /** Handlers for pagination. */
    const nextGroup = () => {
        // Cycles forward (0 -> 1 -> 2 -> 0).
        setCurrentIndex((prevIndex) => (prevIndex + 1) % TOTAL_PAGES);
    };

    const prevGroup = () => {
        // Cycles backward (0 -> 2 -> 1 -> 0).
        setCurrentIndex((prevIndex) => (prevIndex - 1 + TOTAL_PAGES) % TOTAL_PAGES);
    };

    // Calculates the starting index for the current view (0, 3, or 6).
    const start = currentIndex * STORIES_PER_PAGE;
    // Slices the data array to show only the 3 testimonials for the current page.
    const currentStories = displayedTestimonials.slice(start, start + STORIES_PER_PAGE);

    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden font-sans">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900">Real Stories, Real Love ✨</h2>
                        {/* Manual refresh button to trigger new AI generation */}
                        <button
                            onClick={generateTestimonials}
                            disabled={loading}
                            className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:bg-pink-300 disabled:cursor-not-allowed"
                            title="Generate new stories"
                            aria-label="Generate new testimonials"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        See how our AI has helped create thousands of happy unions. AI-powered success stories.
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="text-center mb-8">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={generateTestimonials}
                            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Initial Loading State */}
                {loading && isInitialLoad && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                        <p className="text-gray-600">Generating beautiful love stories...</p>
                    </div>
                )}

                
                {/* Testimonial Display Grid and Pagination */}
                {!isInitialLoad && !loading && displayedTestimonials.length > 0 && (
                    <div className="relative">
                        {/* Grid for 3 cards per page */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {currentStories.map((testimonial, index) => (
                                <TestimonialCard 
                                    // Key combines start index and card index for stability.
                                    key={`${start}-${index}`} 
                                    testimonial={testimonial} 
                                    index={start + index} // Pass global index for unique image generation.
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-12 flex justify-center items-center space-x-4">
                            {/* Previous button */}
                            <button
                                onClick={prevGroup}
                                className="p-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:bg-pink-300"
                                aria-label="Previous testimonial group"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Page dots indicator */}
                            <div className="flex space-x-2">
                                {[...Array(TOTAL_PAGES)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            currentIndex === index ? 'bg-pink-500' : 'bg-pink-200 hover:bg-pink-300'
                                        }`}
                                        aria-label={`Go to testimonial group ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Next button */}
                            <button
                                onClick={nextGroup}
                                className="p-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:bg-pink-300"
                                aria-label="Next testimonial group"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;