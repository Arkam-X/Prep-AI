import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);


export async function POST(request: Request) {
  try {
    const { role, type, level, techstack, amount, userid } = await request.json();

    const questionCount = Number(amount);

    if (
      !role ||
      !type ||
      !level ||
      !techstack ||
      !userid ||
      isNaN(questionCount) ||
      questionCount <= 0
    ) {
      return Response.json(
        { success: false, error: "Invalid input values" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro"
    });

    const prompt = `
      You are an API that returns ONLY valid JSON.

      Generate ${questionCount} interview questions.

      Role: ${role}
      Experience Level: ${level}
      Interview Type:: ${type}
      Tech Stack: ${techstack}

      STRICT RULES:
      - Output ONLY raw JSON
      - No markdown
      - No explanations

      JSON FORMAT:
      [
        "Question 1",
        "Question 2"
      ]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const questions = JSON.parse(cleaned);

    await db.collection("interviews").add({
      role,
      type,
      level,
      techstack: techstack.split(",").map(t => t.trim()),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    });


    return Response.json({ success: true });

  } catch (error: any) {
    console.error("Interview generation error:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
