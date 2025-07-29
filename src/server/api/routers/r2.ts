import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, exerciseProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { uploadedFiles } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { r2 } from "@/lib/r2";

export const r2Router = createTRPCRouter({
  uploadFileSession: exerciseProcedure
    .input(z.object({ contentType: z.string() }))
    .mutation(async ({ input }) => {
      const key = crypto.randomUUID();

      const putObject = new PutObjectCommand({
        Key: key,
        Bucket: env.R2_BUCKET,
        ContentType: input.contentType,
      });
      const getObject = new GetObjectCommand({
        Key: key,
        Bucket: env.R2_BUCKET,
      });

      const uploadUrl = await getSignedUrl(r2, putObject, { expiresIn: 60 });
      const downloadUrl = await getSignedUrl(r2, getObject, {
        expiresIn: 7200, // 2h
      });

      return { uploadUrl, downloadUrl, key };
    }),

  getPresingedGetUrls: exerciseProcedure.query(async ({ ctx, input }) => {
    const keys = await ctx.db
      .select({ key: uploadedFiles.key })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.exerciseId, input.exerciseId))
      .orderBy(uploadedFiles.date);

    const urlsAndKeys = await Promise.all(
      keys.map(async ({ key }) => {
        const object = new GetObjectCommand({
          Key: key,
          Bucket: env.R2_BUCKET,
        });
        const url = await getSignedUrl(r2, object, { expiresIn: 7200 }); // 2 h
        return { url, key };
      }),
    );

    return urlsAndKeys;
  }),

  deleteFile: exerciseProcedure
    .input(z.object({ key: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleteObject = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: input.key,
      });

      try {
        await r2.send(deleteObject);

        await ctx.db
          .delete(uploadedFiles)
          .where(eq(uploadedFiles.key, input.key));
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error with deliting object",
        });
      }
    }),
});
