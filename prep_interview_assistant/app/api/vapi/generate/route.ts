// import { getRandomInterviewCover } from "@/lib/utils";
// import { db } from "@/firebase/admin";

// const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

// /**
//  * Gemini REST helper (stable v1 endpoint)
//  */
// async function generateQuestions(prompt: string): Promise<string> {
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [{ text: prompt }],
//           },
//         ],
//         generationConfig: {
//           temperature: 0.3,
//           maxOutputTokens: 1024,
//         },
//       }),
//     }
//   );

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(err);
//   }

//   const data = await res.json();
//   const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//   if (!text) {
//     throw new Error("No text returned from Gemini");
//   }

//   return text;
// }

// export async function POST(request: Request) {
//   try {
//     const { role, type, level, techstack, amount, userid } =
//       await request.json();

//     const questionCount = Number(amount);

//     if (
//       !role ||
//       !type ||
//       !level ||
//       !techstack ||
//       !userid ||
//       isNaN(questionCount) ||
//       questionCount <= 0
//     ) {
//       return Response.json(
//         { success: false, error: "Invalid input values" },
//         { status: 400 }
//       );
//     }

//     const prompt = `
// Return ONLY valid JSON.

// Generate ${questionCount} interview questions.

// Role: ${role}
// Experience Level: ${level}
// Interview Type: ${type}
// Tech Stack: ${techstack}

// JSON format:
// [
//   "Question 1",
//   "Question 2"
// ]
// `;

//     const rawText = await generateQuestions(prompt);

//     const cleaned = rawText
//       .replace(/```json/gi, "")
//       .replace(/```/g, "")
//       .trim();

//     const questions: string[] = JSON.parse(cleaned);

//     if (!Array.isArray(questions) || questions.length === 0) {
//       throw new Error("Gemini returned invalid questions");
//     }

//     const docRef = await db.collection("interviews").add({
//       role,
//       type,
//       level,
//       techstack: techstack.split(",").map((t: string) => t.trim()),
//       questions,
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     });

//     return Response.json({
//       success: true,
//       interviewId: docRef.id,
//     });
//   } catch (error: any) {
//     console.error("Interview generation error:", error);
//     return Response.json(
//       {
//         success: false,
//         error: error.message || "Internal server error",
//       },
//       { status: 500 }
//     );
//   }
// }

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

// This is not happening my GEMINI is failing to generate questions -> because of this my agent is not able to parse "QUESTION HAS BEEN GENERATED" -> No questions No FIREBASE DB writing operations -> No DB update no further features.
// HAULT.