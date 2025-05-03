import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY environment variable not set. AI features will not work.");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function getAiChatResponse(prompt: string): Promise<ChatResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    return {
      text: response.choices[0].message.content || "Sorry, I couldn't generate a response.",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error("Error in getAiChatResponse:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}

export async function generateDiagnosis(symptoms: string): Promise<ChatResponse> {
  const prompt = `
    I need a detailed differential diagnosis based on the following symptoms:
    ${symptoms}

    Please provide:
    1. Top 3-5 potential diagnoses in order of likelihood
    2. Key clinical findings for each diagnosis
    3. Recommended diagnostic tests
    4. Initial management recommendations

    Reference standard medical textbooks like Harrison's Internal Medicine in your analysis.
  `;

  return getAiChatResponse(prompt);
}

export async function generateQuiz(subject: string, topic: string, difficulty: string, numQuestions: number): Promise<ChatResponse> {
  const prompt = `
    Generate a medical MCQ quiz with the following specifications:
    - Subject: ${subject}
    - Topic: ${topic}
    - Difficulty level: ${difficulty}
    - Number of questions: ${numQuestions}

    For each question:
    1. Provide a clear, concise question
    2. Provide 4 possible answers labeled A-D with only one correct answer
    3. Indicate the correct answer
    4. Include a brief explanation for the correct answer referencing standard medical textbooks

    Format the response as a structured JSON with a questions array containing objects with question, options, correctAnswer, and explanation properties.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return {
      text: response.choices[0].message.content || "Sorry, I couldn't generate a quiz.",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    throw new Error("Failed to generate quiz: " + (error as Error).message);
  }
}

export async function generateMnemonic(topic: string): Promise<ChatResponse> {
  const prompt = `
    Create a memorable mnemonic to help medical students remember the key points about:
    ${topic}

    Include:
    1. The mnemonic itself (acronym or word-based)
    2. What each letter/word stands for
    3. A brief explanation of why this is important to remember
    4. If possible, a visual or story-based association to enhance memory
  `;

  return getAiChatResponse(prompt);
}

export async function generateCaseStudy(speciality: string, difficulty: string): Promise<ChatResponse> {
  const prompt = `
    Generate a realistic clinical case study for medical students aligned to the Indian MBBS curriculum:
    - Specialty: ${speciality}
    - Difficulty: ${difficulty}

    Structure as:
    1. Patient demographics and chief complaint
    2. History of present illness
    3. Past medical history and medications
    4. Physical examination findings
    5. Initial diagnostic results (labs, imaging, etc.)
    6. Questions for students to consider (diagnosis, management)
    7. Final diagnosis and discussion points

    Make it clinically accurate, realistic, and educational.
    Format the response as a structured JSON object.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return {
      text: response.choices[0].message.content || "Sorry, I couldn't generate a case study.",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error("Error in generateCaseStudy:", error);
    throw new Error("Failed to generate case study: " + (error as Error).message);
  }
}

export async function getDrugInformation(drugName: string): Promise<ChatResponse> {
  const prompt = `
    Provide comprehensive information about the drug: ${drugName}

    Include:
    1. Drug class and mechanism of action
    2. FDA-approved indications 
    3. Common off-label uses in clinical practice
    4. Dosing guidelines (standard adult doses)
    5. Important side effects and adverse reactions
    6. Key drug interactions to be aware of
    7. Contraindications
    8. Special considerations (pregnancy, renal/hepatic dosing)

    Present this information in a structured, educational format suitable for medical students.
  `;

  return getAiChatResponse(prompt);
}

export async function generateStudyPlan(
  totalDays: number,
  hoursPerDay: number,
  subjects: string[],
  weakTopics: string,
  startDate: Date
): Promise<ChatResponse> {
  const systemPrompt = `You are an expert medical education planner specializing in creating personalized study plans for medical students preparing for NEET PG and similar exams. Create comprehensive study plans that are practical and trackable.`;

  const userPrompt = `Create a detailed weekly study plan with the following parameters:
  - Total preparation time: ${totalDays} days
  - Daily study hours: ${hoursPerDay} hours
  - Starting date: ${startDate.toISOString().split('T')[0]}
  - Subjects to cover: ${subjects.join(", ")}
  - Weak topics to focus on: ${weakTopics}

  For each day, provide:
  1. Subject and topic to study
  2. Time allocation in hours
  3. Specific tasks (reading, quiz, flashcards)
  4. Resources to use

  Format the response as a JSON array of daily tasks with dates, subjects, topics, and time allocations.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      response_format: { type: "json_object" },
    });

    return {
      text: response.choices[0].message.content || "Sorry, I couldn't generate a study plan.",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error("Error in generateStudyPlan:", error);
    throw new Error("Failed to generate study plan: " + (error as Error).message);
  }
}

export async function generateNotes(topic: string): Promise<ChatResponse> {
  const prompt = `
    Create comprehensive yet concise study notes on the medical topic: ${topic}

    Structure the notes with:
    1. Brief overview/definition
    2. Key concepts and principles
    3. Important details with bullet points
    4. Relevant clinical applications
    5. Mnemonics or memory aids
    6. High-yield facts for exams
    7. Simple diagrams that could be drawn (describe them textually)

    Make these notes ready for medical students to study from, with emphasis on clarity and memorability.
    Focus on information that would appear in standard medical textbooks.
  `;

  return getAiChatResponse(prompt);
}