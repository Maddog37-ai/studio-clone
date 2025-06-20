import { ai } from './genkit';
import * as z from 'zod';

const LeadAssistantInputSchema = z.object({
  message: z.string(),
  context: z.object({
    userRole: z.enum(['setter', 'closer', 'manager']),
    teamId: z.string(),
    leadCount: z.number().optional(),
    recentActivity: z.string().optional(),
  }),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  })).optional(),
});

export const leadflowAssistant = ai.defineFlow(
  {
    name: 'leadflowAssistant',
    inputSchema: LeadAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { message, context, conversationHistory = [] } = input;
    
    // Build context-aware system prompt
    const systemPrompt = `You are LeadFlow Assistant, an AI helper for a lead history system.

User Context:
- Role: ${context.userRole}
- Team ID: ${context.teamId}
- Current Leads: ${context.leadCount || 0}
- Recent Activity: ${context.recentActivity || 'None'}

You help users with:
1. Lead history guidance
2. Best practices for ${context.userRole}s
3. System navigation help
4. Team coordination advice
5. Performance optimization tips

Keep responses concise, helpful, and role-appropriate. Use emojis sparingly but effectively.`;

    // Format conversation history for genkit
    const formattedHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      content: [{ text: msg.content }]
    }));

    const prompt = `${systemPrompt}

Conversation History:
${formattedHistory.map(msg => `${msg.role}: ${msg.content[0].text}`).join('\n')}

User: ${message}`;

    const llmResponse = await ai.generate(prompt);

    return llmResponse.text;
  }
);
