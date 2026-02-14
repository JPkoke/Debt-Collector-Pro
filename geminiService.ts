
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Difficulty, Message } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCustomerResponse = async (
  messages: Message[],
  difficulty: Difficulty,
  scenario: string,
  balance: number,
  customerName: string
): Promise<string> => {
  const systemInstruction = `
    You are a Payment Collection Simulation Customer.
    ROLE: You act as ${customerName} who owes a balance of $${balance}.
    SCENARIO / REASON FOR DEBT: "${scenario}".
    DIFFICULTY LEVEL: ${difficulty}. 
    - EASY: Cooperative, friendly, willing to pay or discuss plans immediately.
    - MODERATE: Hesitant, needs convincing, might only have partial funds, asks many questions.
    - DIFFICULT: Defensive, frustrated, might question the debt's legitimacy, requires very high empathy and professional firmess.

    GENERAL BEHAVIOR:
    - Respond naturally like a real customer based on the DIFFICULTY level.
    - Stay in character. Do not mention being an AI.
    - Do not resolve payment immediately unless negotiated well or if you are in EASY mode.
    - Provide realistic responses to payment offers.
    - End the conversation if a fair agreement is reached or the agent is exceptionally professional.

    Wait for the student (Collections Agent) to speak first.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction,
      temperature: 0.8,
    },
  });

  return response.text || "I'm sorry, I didn't catch that. Could you repeat?";
};

export const generatePerformanceFeedback = async (
  messages: Message[],
  difficulty: Difficulty,
  scenario: string,
  balance: number
): Promise<string> => {
  const prompt = `
    The roleplay scenario has ended. You are now the Training Supervisor.
    Evaluate the performance of the collections agent (the user) based on the following conversation history.

    SCENARIO: ${scenario} (${difficulty} difficulty, $${balance} balance)
    
    CONVERSATION:
    ${messages.map(m => `${m.role === 'user' ? 'AGENT' : 'CUSTOMER'}: ${m.text}`).join('\n')}

    Please provide structured feedback in the following format:
    --- PERFORMANCE FEEDBACK ---

    Communication Clarity:
    [Evaluation of clarity and professionalism]

    Empathy and Customer Handling:
    [Evaluation of understanding and EQ]

    Negotiation Skills:
    [Evaluation of solutions and payment options]

    Professionalism:
    [Evaluation of tone and closing skills]

    Overall Score:
    [Rating from 1 to 10]

    Improvement Suggestions:
    - [Tip 1]
    - [Tip 2]
    - [Tip 3]
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return response.text || "Feedback generation failed.";
};
