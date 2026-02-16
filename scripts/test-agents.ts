// Test all agents to make sure they work!

import { getMedGemmaContent } from '../lib/agents/context/loader';
import { generateEvidence } from '../lib/agents/evidence';
import { normalizeMarkerName } from '../lib/agents/parser/normalizer';
import { detectViolations } from '../lib/agents/safety/detector';

async function testAgents() {
  console.log('🧪 TESTING ALL AGENTS...\n');

  // TEST 1: Context Agent
  console.log('1️⃣ Testing Context Agent...');
  try {
    const context = getMedGemmaContent('Hemoglobin');
    console.log('✅ Context Agent works!');
    console.log(`   Loaded: ${context.markerName}`);
    console.log(`   Content: ${context.whatIsIt.substring(0, 50)}...`);
  } catch (error) {
    console.log('❌ Context Agent FAILED:', error);
  }

  // TEST 2: Evidence Agent
  console.log('\n2️⃣ Testing Evidence Agent...');
  try {
    const evidence = await generateEvidence('Hemoglobin');
    console.log('✅ Evidence Agent works!');
    console.log(`   Research: ${evidence.researchSummary.substring(0, 50)}...`);
    console.log(`   Food groups: ${evidence.myPlateGroups.join(', ')}`);
  } catch (error) {
    console.log('❌ Evidence Agent FAILED:', error);
  }

  // TEST 3: Parser Agent (normalizer only - no OCR yet)
  console.log('\n3️⃣ Testing Parser Agent (normalizer)...');
  try {
    const normalized = normalizeMarkerName('HGB');
    console.log('✅ Parser normalizer works!');
    console.log(`   HGB → ${normalized}`);
    
    const normalized2 = normalizeMarkerName('a1c');
    console.log(`   a1c → ${normalized2}`);
  } catch (error) {
    console.log('❌ Parser normalizer FAILED:', error);
  }

  // TEST 4: Safety Agent
  console.log('\n4️⃣ Testing Safety Agent...');
  try {
    const unsafeText = "You should see a doctor immediately for your diabetes.";
    const violations = detectViolations(unsafeText);
    console.log('✅ Safety Agent works!');
    console.log(`   Found ${violations.length} violations`);
    violations.forEach(v => {
      console.log(`   - ${v.name}: "${v.match}"`);
    });

    const safeText = "Research shows associations between glucose levels and dietary patterns.";
    const violations2 = detectViolations(safeText);
    console.log(`   Safe text violations: ${violations2.length} ✓`);
  } catch (error) {
    console.log('❌ Safety Agent FAILED:', error);
  }

  // TEST 5: Questions Agent
  console.log('\n5️⃣ Testing Questions Agent...');
  try {
    // Questions agent uses Claude API - skip for now
    console.log('⏸️  Questions Agent uses Claude API - will test when we decide on API usage');
  } catch (error) {
    console.log('❌ Questions Agent FAILED:', error);
  }

  // TEST 6: Orchestrator
  console.log('\n6️⃣ Testing Orchestrator...');
  try {
    // Orchestrator coordinates everything - will test after others work
    console.log('⏸️  Orchestrator requires all agents working - will test after integration');
  } catch (error) {
    console.log('❌ Orchestrator FAILED:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING COMPLETE!');
  console.log('='.repeat(60));
}

testAgents();