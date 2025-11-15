/**
 * Gemini AI Configuration
 * Separate configs for different use cases
 */

const { Type } = require('@google/genai');

/**
 *  configuration for fridge ingredient detection
 */

const fridgeAnalysisConfig = {
  temperature: 0.2,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  imageConfig: {
    imageSize: '1K',
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["Ingredients"],
    description: "List of ingredients in image",
    properties: {
      Ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  },
};

const ingredientsAnalysisConfig = {
  temperature: 0.2,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  imageConfig: {
    imageSize: '1K',
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["include", "exclude"],
    properties: {
      include: {
        type: Type.ARRAY,
        description: "List of safe ingredients the patient can consume",
        items: {
          type: Type.STRING,
        },
      },
      exclude: {
        type: Type.ARRAY,
        description: "List of ingredients to avoid",
        items: {
          type: Type.STRING,
        },
      },
    },
  },
};


module.exports = {
  fridgeAnalysisConfig,
  ingredientsAnalysisConfig,
};
