const { GoogleGenerativeAI } = require('@google/generative-ai');
const promptTemplates = require('./promptTemplates');

async function generate(prompt, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = promptTemplates.generateSystemPrompt();
    const finalPrompt = `${systemPrompt}\n\nUser Request: "${prompt}"`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON block out of the generated markdown text
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini Workflow Generation Error:', error);
    throw error;
  }
}

module.exports = {
  generate,
};
