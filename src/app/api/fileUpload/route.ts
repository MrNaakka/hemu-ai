// import { db } from "@/server/db";
// import { exercises, uploadedFiles } from "@/server/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";

// import { NextResponse, type NextRequest } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { env } from "@/env";
// import { z } from "zod";

// const r2 = new S3Client({
//   region: "auto",
//   endpoint: env.R2_ENDPOINT,
//   credentials: {
//     accessKeyId: env.R2_ACCESS_KEY_ID,
//     secretAccessKey: env.R2_SECRET_ACCESS_KEY,
//   },
// });

// export async function POST(req: NextRequest) {
//   const formdata = await req.formData();
//   const parsed = z.string().uuid().safeParse(formdata.get("exerciseId"));
//   if (!parsed.success) {
//     return NextResponse.json(
//       { success: false, error: "invalid exerciseId" },
//       { status: 400 },
//     );
//   }
//   const exerciseId = parsed.data;

//   const { userId } = await auth();

//   if (!userId) {
//     return NextResponse.json(
//       { success: false, error: "invalid userId" },
//       { status: 401 },
//     );
//   }

//   const result = await db
//     .select({ userId: exercises.userId })
//     .from(exercises)
//     .where(eq(exercises.exerciseId, exerciseId));

//   if (result.length !== 1 || result[0]!.userId !== userId) {
//     return NextResponse.json(
//       { success: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }
//   const file = formdata.get("file") as File;

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const commandKey = crypto.randomUUID();

//   const command = new PutObjectCommand({
//     Key: commandKey,
//     Bucket: env.R2_BUCKET,
//     Body: buffer,
//     ContentType: file.type,
//   });

//   try {
//     await r2.send(command);

//     await db
//       .insert(uploadedFiles)
//       .values({ exerciseId: exerciseId, key: commandKey });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: "error with sending data to r2" },
//       { status: 500 },
//     );
//   }
// }
