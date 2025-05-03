import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

interface ChatCompletionRequest {
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  systemPrompt?: string;
}

export interface CompletionResponse {
  text: string;
  tokensUsed: number;
}

export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<CompletionResponse> {
  try {
    const messages = [];
    
    if (request.systemPrompt) {
      messages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }
    
    messages.push(...request.messages);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens,
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get response from OpenAI API");
  }
}

export async function generateQuizQuestions(
  subject: string,
  topic: string,
  difficulty: string,
  count: number
): Promise<any> {
  const systemPrompt = `You are a medical education expert specializing in creating high-quality MCQ questions for medical students.
  Create ${count} multiple-choice questions about ${subject}, specifically on the topic of ${topic} at a ${difficulty} difficulty level.
  Base these questions on standard medical textbooks like Harrison's Internal Medicine, Robbins Pathology, and Guyton's Physiology.
  Format the response as a JSON array of objects with the following structure:
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The correct option (A, B, C, or D)",
    "explanation": "Detailed explanation with reference to the source textbook"
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${count} ${difficulty} level MCQs on ${topic} in ${subject}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    return {
      questions: JSON.parse(content || "{}").questions || [],
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function generateMnemonic(
  topic: string,
  complexity: string
): Promise<CompletionResponse> {
  const systemPrompt = `You are a medical education expert specializing in creating memorable mnemonics and learning aids for medical students.
  Create easy-to-remember mnemonics, analogies, or simplified explanations for complex medical topics.
  Make your response clear, concise, and optimized for memory retention.`;
  
  const userPrompt = `Create a ${complexity} mnemonic or memory aid for understanding and remembering ${topic}. 
  Include the mnemonic, its explanation, and how to use it in studying.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error generating mnemonic:", error);
    throw new Error("Failed to generate mnemonic");
  }
}

export async function generateClinicalCase(
  specialty: string,
  complexity: string
): Promise<CompletionResponse> {
  const systemPrompt = `You are a medical education expert specializing in creating realistic clinical case studies for medical students in India.
  Create detailed, educational clinical scenarios that align with the Indian MBBS curriculum.
  Include patient history, examination findings, diagnostic considerations, and learning points.`;
  
  const userPrompt = `Generate a ${complexity} clinical case study in ${specialty} that would be relevant for Indian medical students.
  Structure it with: 
  1. Patient presentation 
  2. History and examination findings
  3. Relevant investigations
  4. Differential diagnoses
  5. Final diagnosis and management
  6. Learning points`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error generating clinical case:", error);
    throw new Error("Failed to generate clinical case");
  }
}

export async function getDrugInformation(
  drugName: string
): Promise<CompletionResponse> {
  const systemPrompt = `You are a pharmacology expert providing accurate, concise information about medications.
  When asked about a drug, provide a structured summary including:
  1. Drug class and mechanism of action
  2. Main indications
  3. Common adverse effects
  4. Contraindications and warnings
  5. Important drug interactions
  Base your information on authoritative sources like the British National Formulary and standard pharmacology textbooks.`;
  
  const userPrompt = `Provide information about ${drugName}`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error getting drug information:", error);
    throw new Error("Failed to retrieve drug information");
  }
}

export async function generateStudyPlan(
  goalExam: string,
  timeLeftDays: number,
  subjects: string[]
): Promise<CompletionResponse> {
  const systemPrompt = `You are an expert medical education planner specializing in creating personalized study plans for medical students.
  Create a comprehensive study plan that helps students efficiently prepare for their exams.
  Your plans should be practical, well-structured, and adaptable.`;
  
  const userPrompt = `Create a detailed study plan for a medical student preparing for ${goalExam} with ${timeLeftDays} days remaining.
  The student needs to cover these subjects: ${subjects.join(", ")}.
  Include:
  1. Daily and weekly schedule breakdown
  2. Time allocation for each subject based on importance and complexity
  3. Recommended resources for each subject
  4. Suggested practice and revision strategy
  5. Tips for efficient studying and avoiding burnout`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
}

export async function generateNotes(
  topic: string,
  style: string,
  language: string = "Formal English"
): Promise<CompletionResponse> {
  const systemPrompt = `You are a medical educator specializing in creating concise, high-quality study notes for medical students.
  Your notes should be in ${language} and follow the ${style} format.
  Base your content on standard medical textbooks and current guidelines.`;
  
  let structurePrompt = "";
  switch (style) {
    case "Bullet Points":
      structurePrompt = `
      1. Brief overview (2-3 bullet points)
      2. Key concepts (5-7 concise bullet points)
      3. Clinical relevance (3-4 bullet points)
      4. High-yield points (4-5 bullet points)`;
      break;
    case "Mnemonics + Memory Aids":
      structurePrompt = `
      1. Brief topic overview
      2. 2-3 memorable mnemonics
      3. Visual memory aids or associations
      4. Practice recall points`;
      break;
    default: // Detailed Explanation
      structurePrompt = `
      1. Comprehensive definition and background
      2. Detailed explanation of mechanisms
      3. Clinical applications
      4. Key points to remember`;
  }
  
  const userPrompt = `Create study notes on "${topic}" using the following structure:
  ${structurePrompt}
  
  Format the response in ${language} with clear headings (###) and appropriate formatting.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to generate notes");
  }
}

export async function diagnosisAssistant(
  patientInfo: any,
  symptoms: string,
  findings: string
): Promise<CompletionResponse> {
  const systemPrompt = `You are a medical diagnosis assistant trained to analyze patient information and suggest possible differential diagnoses.
  Base your analysis on standard medical textbooks like Harrison's Internal Medicine.
  Provide a structured, educational response suitable for medical students.`;
  
  const userPrompt = `Based on the following patient information and findings, suggest possible diagnoses, recommended investigations, and next steps:
  
  Patient: ${JSON.stringify(patientInfo)}
  Symptoms: ${symptoms}
  Clinical Findings: ${findings}
  
  Structure your response with:
  1. Summary of key findings
  2. Differential diagnoses (most to least likely)
  3. Recommended investigations
  4. Management considerations`;
  
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error("Error using diagnosis assistant:", error);
    throw new Error("Failed to get diagnostic suggestions");
  }
}
