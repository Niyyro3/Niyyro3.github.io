
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/provide-topic-summaries.ts';
import '@/ai/flows/generate-practice-questions.ts';
import '@/ai/flows/generate-flashcards';
import '@/ai/flows/generate-written-question';
import '@/ai/flows/generate-cloze-test';
import '@/ai/flows/chat-helper';
import '@/ai/flows/explain-exam-question';
import '@/ai/flows/generate-lesson';
import '@/ai/flows/generate-speech';
import '@/ai/flows/grade-written-answer';
import '@/ai/flows/summarize-and-speak';
import '@/ai/tools/youtube-search';
import '@/ai/flows/generate-glossary-entry';
import '@/ai/flows/generate-matching-quiz';
