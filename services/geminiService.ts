
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a professional and detailed case description based on a given title.
 * @param title The title of the case.
 * @returns A promise that resolves to the suggested description string.
 */
export async function getCaseDescriptionSuggestion(title: string): Promise<string> {
  if (!title) {
    return "";
  }

  const prompt = `
    Based on the following case title, generate a professional, concise, and helpful case description. 
    The description should elaborate on the potential issue, suggest possible impacts, and mention next steps or areas to investigate.
    Do not include a title or subject line in your response, only provide the description text itself.

    Case Title: "${title}"

    Description:
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.5,
            topP: 1,
            topK: 32,
        }
    });
    
    // The .text property is the recommended way to get the text.
    const text = response.text;
    
    if (!text) {
        throw new Error("No text returned from Gemini API");
    }

    return text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Propagate a more user-friendly error message
    throw new Error("Failed to get suggestion from AI service.");
  }
}

/**
 * Generates a user invitation email.
 * @param inviterName The name of the person sending the invite.
 * @param inviteeEmail The email of the new user.
 * @param role The role assigned to the new user.
 * @returns A promise that resolves to an object with email subject and body.
 */
export async function generateInviteEmail(inviterName: string, inviteeEmail: string, role: string): Promise<{ subject: string; body: string; }> {
    const prompt = `
        You are an onboarding assistant for a company using a new dynamic workspace platform.
        Your task is to generate an invitation email.
        The inviter is ${inviterName}.
        The invitee's email is ${inviteeEmail}.
        The invitee's role will be ${role}.

        Generate a welcoming and professional email. 
        - The subject should be exciting and informative.
        - The body should be in HTML format.
        - Mention the platform name "Synergize" and the inviter's name.
        - Include a placeholder call-to-action button like '<a href="#" class="button">Accept Invitation</a>'.
        - Make it look visually appealing with some basic inline CSS.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: {
                            type: Type.STRING,
                            description: "The subject line of the email."
                        },
                        body: {
                            type: Type.STRING,
                            description: "The HTML body of the email."
                        }
                    },
                    required: ["subject", "body"],
                },
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Empty response from Gemini API");
        }
        
        // Sometimes the API might return the JSON wrapped in markdown backticks
        const cleanJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        return JSON.parse(cleanJsonText);

    } catch (error) {
        console.error("Error calling Gemini API for email generation:", error);
        throw new Error("Failed to generate invitation email.");
    }
}