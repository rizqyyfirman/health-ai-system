require('dotenv').config({ path: __dirname + '/.env' });
const Groq = require('groq-sdk');

console.log('Current directory:', __dirname);
console.log('Looking for .env at:', __dirname + '/.env');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Ganti dengan GROQ_API_KEY
});

async function testAI() {
  console.log('\n🔍 Testing Groq API...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY tidak ditemukan di .env');
    console.error('Silakan cek file .env di folder backend/');
    return;
  }

  console.log('✅ API Key found:', process.env.GROQ_API_KEY?.substring(0, 20) + '...\n');

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // atau model Groq lainnya
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: 'Say "Hello, API is working!"'
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    console.log('✅ API Response:', completion.choices[0].message.content);
    console.log('✅ Groq API is working!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.status === 401) {
      console.error('\n❌ API Key tidak valid!');
      console.error('Silakan cek di: https://console.groq.com/keys');
    }
  }
}

testAI();