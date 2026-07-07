const env = require('../config/env');
const openrouterGenerator = require('./generators/openrouterGenerator');
const geminiGenerator = require('./generators/geminiGenerator');
const deterministicGenerator = require('./generators/deterministicGenerator');

async function generateWorkflowFromPrompt(prompt) {
  // 1. Try OpenRouter if key is available
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log('🔮 Generating workflow using OpenRouter...');
      return await openrouterGenerator.generate(prompt, env.OPENROUTER_API_KEY);
    } catch (error) {
      console.error('OpenRouter generation failed, falling back to Gemini...', error.message);
    }
  }

  // 2. Try Gemini SDK if key is available
  if (env.GEMINI_API_KEY) {
    try {
      console.log('🔮 Generating workflow using Google Gemini SDK...');
      return await geminiGenerator.generate(prompt, env.GEMINI_API_KEY);
    } catch (error) {
      console.error('Gemini generation failed, falling back to deterministic...', error.message);
    }
  }

  // 3. Fallback to Rule-Based Builder
  console.log('🤖 Generating workflow using deterministic fallback rule builder...');
  return await deterministicGenerator.generate(prompt);
}

module.exports = {
  generateWorkflowFromPrompt,
};
