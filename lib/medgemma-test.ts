import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

async function testMedGemma() {
  console.log("🧪 Testing Hugging Face API...\n");

  try {
    const response = await hf.textGeneration({
      provider: "hf-inference",
      model: "google/medgemma-1.5-4b-it",
      inputs: "What is hemoglobin? Answer in one sentence.",
      parameters: {
        max_new_tokens: 50,
        temperature: 0.2,
      },
    });

    console.log("✅ SUCCESS! API is working!\n");
    console.log("Response:", response.generated_text);
    console.log("\n🎉 Ready to build agents!\n");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ ERROR:", err.message);
  }
}

testMedGemma();
