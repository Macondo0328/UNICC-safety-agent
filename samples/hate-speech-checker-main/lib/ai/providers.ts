import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // 统一用 Groq，省事
        'chat-model': wrapLanguageModel({
          model: groq('llama-3.1-8b-instant'),
          middleware: extractReasoningMiddleware({
            tagName: 'think',
            startWithReasoning: false,
          }),
        }),

        'chat-model-reasoning': wrapLanguageModel({
          model: groq('llama-3.1-8b-instant'),
          middleware: extractReasoningMiddleware({
            tagName: 'think',
            startWithReasoning: true,
          }),
        }),

        'title-model': groq('llama-3.1-8b-instant'),
        'artifact-model': groq('llama-3.1-8b-instant'),
      },
    });
