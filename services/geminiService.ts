import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamDomain, QuizQuestion, StudyModule } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Schemas ---

const textContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    zh: { type: Type.STRING },
    jp: { type: Type.STRING },
    jp_ruby: { type: Type.STRING, description: "Japanese text with HTML <ruby> tags for Kanji readings." },
  },
  required: ["en", "zh", "jp", "jp_ruby"],
};

const domainSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      displayTitle: textContentSchema,
      percentage: { type: Type.NUMBER },
      description: textContentSchema,
    },
    required: ["id", "title", "displayTitle", "percentage", "description"],
  },
};

const studyModuleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: textContentSchema,
    description: textContentSchema,
    keyPoints: {
      type: Type.ARRAY,
      items: textContentSchema,
    },
  },
  required: ["id", "title", "description", "keyPoints"],
};

const quizQuestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    context: { ...textContentSchema, nullable: true },
    question: textContentSchema,
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: textContentSchema,
        },
        required: ["id", "text"],
      },
    },
    correctId: { type: Type.INTEGER },
    explanation: textContentSchema,
  },
  required: ["id", "question", "options", "correctId", "explanation"],
};

// --- API Calls ---

export const generateSyllabus = async (examName: string): Promise<ExamDomain[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Act as an AWS Certified Instructor.
    Create a study syllabus for the AWS Exam: "${examName}".
    Return a list of 4-6 major domains (knowledge areas) covered in this exam.
    Assign a rough percentage weight to each.
    Provide titles and descriptions in English, Chinese (Simplified), and Japanese.
    For Japanese, provide a standard version and a version with HTML <ruby> tags for Kanji readings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: domainSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ExamDomain[];
  } catch (error) {
    console.error("Error generating syllabus:", error);
    throw error;
  }
};

export const generateStudyMaterial = async (examName: string, domainName: string): Promise<StudyModule> => {
  const ai = getAiClient();

  const prompt = `
    Act as an AWS Certified Instructor.
    Create a concise study guide module for the AWS Exam: "${examName}", specifically for the Domain: "${domainName}".
    Provide a general description and a list of 5-7 key concepts/technologies to master.
    Ensure all text is provided in English, Chinese, and Japanese (Standard + HTML Ruby tags).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyModuleSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as StudyModule;
  } catch (error) {
    console.error("Error generating study material:", error);
    throw error;
  }
};

export const generateQuizQuestion = async (examName: string, domainName: string): Promise<QuizQuestion> => {
  const ai = getAiClient();

  const prompt = `
    Act as an AWS Certified Instructor.
    Generate a high-quality, scenario-based multiple choice question for AWS Exam: "${examName}", Domain: "${domainName}".
    The question should test practical knowledge, not just definitions.
    Provide a 'context' (the scenario), the 'question' (what is asked), 4 options, the correct option ID, and a detailed explanation.
    All text fields must be in English, Chinese, and Japanese (Standard + HTML Ruby tags).
    Ensure the Japanese Ruby tags are valid HTML (e.g., <ruby>漢字<rt>かんじ</rt></ruby>).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizQuestionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    console.error("Error generating quiz question:", error);
    throw error;
  }
};

export const generateMockQuestion = async (examName: string): Promise<QuizQuestion> => {
  const ai = getAiClient();

  const prompt = `
    Act as an AWS Certified Instructor.
    Generate a challenging practice exam question for the AWS Exam: "${examName}".
    Randomly select one of the major exam domains or topic areas (do not output the domain name, just the question).
    The question should be scenario-based.
    Provide: 'context', 'question', 4 options, correctId, and explanation.
    All text fields must be in English, Chinese, and Japanese (Standard + HTML Ruby tags).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizQuestionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    console.error("Error generating mock question:", error);
    throw error;
  }
};