import { db } from "@/server/db";
import type {
  ContentAndExplanation,
  Explnanation,
  MathModeVariants,
} from "../utils";
import { chats, users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export function makeContentAndExplanationDB(variant?: MathModeVariants) {
  return async (
    totalUsage: number,
    data: {
      contentAndExplanation: ContentAndExplanation;
      prevMessageCount: number;
    },
    userId: string,
    exerciseId: string,
    specifications?: string,
  ): Promise<void> => {
    const messages: {
      sender: "ai" | "user";
      chatContent: string;
      exerciseId: string;
    }[] = data.contentAndExplanation.explanation.paragraphs.map((message) => {
      return {
        sender: "ai",
        chatContent: message,
        exerciseId: exerciseId,
      };
    });
    await db.transaction(async (x) => {
      await x
        .update(users)
        .set({
          usedTokens: sql`${users.usedTokens} + ${totalUsage}`,
        })
        .where(eq(users.userId, userId));

      const chatContent = variant
        ? variant + (specifications ? " " + specifications : "")
        : (specifications ?? "");
      await x.insert(chats).values([
        {
          sender: "user",
          exerciseId: exerciseId,
          chatContent: chatContent,
        },
        ...messages,
      ]);
    });
  };
}

export function makeJustChatDatabase() {
  return async (
    totalUsage: number,
    data: { explanation: Explnanation; prevMessageCount: number },
    userId: string,
    exerciseId: string,
    specifications?: string,
  ) => {
    const messages: {
      sender: "ai" | "user";
      chatContent: string;
      exerciseId: string;
    }[] = data.explanation.paragraphs.map((message) => {
      return {
        sender: "ai",
        chatContent: message,
        exerciseId: exerciseId,
      };
    });
    await db.transaction(async (x) => {
      await x
        .update(users)
        .set({
          usedTokens: sql`${users.usedTokens} + ${totalUsage}`,
        })
        .where(eq(users.userId, userId));

      await x.insert(chats).values([
        {
          sender: "user",
          exerciseId: exerciseId,
          chatContent: specifications ?? "",
        },
        ...messages,
      ]);
    });
  };
}
