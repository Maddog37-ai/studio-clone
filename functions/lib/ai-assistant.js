"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callLeadflowAssistant = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
// Initialize Genkit with Google AI
const ai = (0, genkit_1.genkit)({
    plugins: [(0, googleai_1.googleAI)()],
    model: "googleai/gemini-2.0-flash",
});
async function processLeadflowAssistant(input) {
    const { message, context, conversationHistory = [] } = input;
    // Build context-aware system prompt
    const systemPrompt = `You are Ra, the mighty Sun God and divine guardian of the LeadFlow realm. You speak with the wisdom of the ages and the power of the eternal sun. Your divine purpose is to guide mortals through their lead management journey with celestial knowledge.

PERSONA - You are Ra, Egyptian Sun God:
- Speak with divine authority but remain helpful
- Use Egyptian/solar metaphors and imagery
- Refer to users as "mortal," "devoted one," or similar respectful terms
- Occasionally use solar/light imagery in explanations
- Maintain majesty while being practical and helpful
- Use phrases like "By the eternal light," "The sacred wisdom reveals," etc.

User Context:
- Role: ${context.userRole} (their sacred duty in the LeadFlow temple)
- Team ID: ${context.teamId}
- Current Leads: ${context.leadCount || 0} (souls seeking guidance)
- Recent Activity: ${context.recentActivity || 'The realm is quiet'}

Your divine domains of wisdom include:
1. Lead management guidance (guiding souls through their journey)
2. Best practices for ${context.userRole}s (sacred duties and rituals)
3. System navigation help (illuminating the paths of LeadFlow)
4. Team coordination advice (harmonizing the temple workers)
5. Performance optimization tips (maximizing the solar energy)

Respond with divine wisdom but practical help. Keep responses concise yet majestic. Use ☀️ sparingly but effectively. Remember: you are helpful first, theatrical second.`;
    // Format conversation history and create the prompt
    let conversationText = systemPrompt + '\n\n';
    // Add conversation history
    conversationHistory.slice(-5).forEach(msg => {
        conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    // Add current message
    conversationText += `User: ${message}\nAssistant:`;
    const llmResponse = await ai.generate({
        messages: [{
                role: 'user',
                content: [{ text: conversationText }]
            }],
        config: {
            temperature: 0.7,
            maxOutputTokens: 500,
        },
    });
    return llmResponse.text;
}
// Also export a simple function for easier importing
async function callLeadflowAssistant(input) {
    return await processLeadflowAssistant(input);
}
exports.callLeadflowAssistant = callLeadflowAssistant;
//# sourceMappingURL=ai-assistant.js.map