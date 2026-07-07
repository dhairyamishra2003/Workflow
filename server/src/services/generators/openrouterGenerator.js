const axios = require('axios');
const promptTemplates = require('./promptTemplates');

async function generate(prompt, apiKey) {
  try {
    const systemPrompt = promptTemplates.generateSystemPrompt();
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agentflow.ai',
          'X-Title': 'Agentflow AI',
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('OpenRouter Workflow Generation Error:', error);
    throw error;
  }
}

module.exports = {
  generate,
};
