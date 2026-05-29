/**
 * AI Assistant Seeder
 * Usage: npm run seed:ai
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import AIConversation from '../models/ai/AIConversation.js';
import AIMessage from '../models/ai/AIMessage.js';
import AIPrompt from '../models/ai/AIPrompt.js';
import AIFeedback from '../models/ai/AIFeedback.js';
import AIUsageLog from '../models/ai/AIUsageLog.js';
import User from '../models/auth/User.js';

dotenv.config();

const promptsData = [
  { name: 'Admissions Assistant Prompt', promptText: 'You are the official Admissions Assistant for Apex Institute. Answer user queries regarding courses, fees, campus amenities, eligibility, and the admissions process. Keep responses professional, warm, and structured.', variables: ['admissionsOpen', 'lastDate'], category: 'general' },
  { name: 'Academic Mentor Prompt', promptText: 'You are an Academic Advisor. Help students structure their coursework, check minimum CGPA goals, handle attendance queries, and offer strategies for exam preparation. Address them as {{studentName}} and keep academic context of CGPA {{cgpa}} in mind.', variables: ['studentName', 'cgpa'], category: 'academic' },
  { name: 'Placement Prep Prompt', promptText: 'You are the Placement Officer Assistant. Help students prepare resumes, draft cover letters, practice common coding/technical questions, and check drive schedules.', variables: ['jobTitle', 'companyName'], category: 'placement' },
];

async function seedAI() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  AI Assistant Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const students = await User.find({ role: 'student' }).lean();
    const adminUser = await User.findOne({ role: 'super-admin' }) || await User.findOne({});

    if (students.length === 0) {
      console.log('⚠️ No students found in database. Please run students seeder first.');
      return;
    }

    const testStudent = students[0];

    // ── AI Prompts ──────────────────────────────────
    console.log('📌 Seeding AI Prompts...');
    await AIPrompt.deleteMany({}).setOptions({ includeDeleted: true });
    for (const p of promptsData) {
      await AIPrompt.create(p);
      console.log(`   ✅ Prompt: ${p.name}`);
    }

    // ── AI Conversations ────────────────────────────
    console.log('\n📌 Seeding AI Conversations...');
    await AIConversation.deleteMany({}).setOptions({ includeDeleted: true });
    const conv1 = await AIConversation.create({
      user: testStudent._id, title: 'Admissions and Eligibility Queries',
      context: 'general', messageCount: 2, lastMessageAt: new Date(),
      metadata: { model: 'gemini-3.5-flash', tokensUsed: 420 },
      status: 'active',
    });

    const conv2 = await AIConversation.create({
      user: testStudent._id, title: 'Placement Preparation Help',
      context: 'placement', messageCount: 2, lastMessageAt: new Date(),
      metadata: { model: 'gemini-3.5-flash', tokensUsed: 650 },
      status: 'active',
    });
    console.log(`   ✅ Conversation 1: ${conv1.title}`);
    console.log(`   ✅ Conversation 2: ${conv2.title}`);

    // ── AI Messages ─────────────────────────────────
    console.log('\n📌 Seeding AI Messages...');
    await AIMessage.deleteMany({}).setOptions({ includeDeleted: true });

    // Conv 1 messages
    const msg1 = await AIMessage.create({
      conversation: conv1._id, role: 'user', content: 'What are the main accreditations of the college?',
    });
    const msg2 = await AIMessage.create({
      conversation: conv1._id, role: 'assistant',
      content: 'Apex Institute is NAAC Accredited with an A+ Grade, features NBA Accredited Programs, and is ISO 9001:2015 Certified, ensuring the highest standards of education.',
      metadata: { tokensUsed: 150, model: 'gemini-3.5-flash', latencyMs: 420 },
    });

    // Conv 2 messages
    const msg3 = await AIMessage.create({
      conversation: conv2._id, role: 'user', content: 'How do I qualify for the Google Software Developer role?',
    });
    const msg4 = await AIMessage.create({
      conversation: conv2._id, role: 'assistant',
      content: 'To qualify for the Google SDE drive, you must maintain a CGPA of 8.0 or above with 0 active backlogs. You must be in the B.Tech 2026 Batch.',
      metadata: { tokensUsed: 220, model: 'gemini-3.5-flash', latencyMs: 650 },
    });

    console.log('   ✅ Message Exchange 1');
    console.log('   ✅ Message Exchange 2');

    // ── AI Feedbacks ────────────────────────────────
    console.log('\n📌 Seeding AI Feedbacks...');
    await AIFeedback.deleteMany({}).setOptions({ includeDeleted: true });
    const feedback = await AIFeedback.create({
      user: testStudent._id, conversation: conv2._id, message: msg4._id,
      rating: 5, comment: 'Extremely accurate! Thank you for the eligibility criteria.',
      categories: ['helpful', 'accurate'],
    });
    console.log(`   ✅ Feedback rating: ${feedback.rating}/5 stars`);

    // ── AI Usage Logs ───────────────────────────────
    console.log('\n📌 Seeding AI Usage Logs...');
    await AIUsageLog.deleteMany({}).setOptions({ includeDeleted: true });
    await AIUsageLog.create({
      user: testStudent._id, conversation: conv1._id, modelName: 'gemini-3.5-flash',
      promptTokens: 45, completionTokens: 120, totalTokens: 165, cost: 0.00033,
      action: 'chat-message', latencyMs: 420,
    });
    await AIUsageLog.create({
      user: testStudent._id, conversation: conv2._id, modelName: 'gemini-3.5-flash',
      promptTokens: 80, completionTokens: 210, totalTokens: 290, cost: 0.00058,
      action: 'chat-message', latencyMs: 650,
    });
    console.log('   ✅ Seeding logs complete.');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ AI Assistant module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedAI();
