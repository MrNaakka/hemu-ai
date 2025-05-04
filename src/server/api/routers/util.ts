import { z } from "zod";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import TeXToSVG from "tex-to-svg";

//const ipaFont = require.resolve("text-to-svg/build/fonts/ipag.ttf");

export const utilRouter = createTRPCRouter({
  updatedSrc: publicProcedure
    .input(z.object({ latex: z.string() }))
    .mutation(({ input }) => {
      const svg = TeXToSVG(input.latex).replace(
        /fill="currentColor"/g,
        'fill="white"',
      );
      // const textToSVG = TeXToSVG.loadSync();

      // const svg = textToSVG.getSVG(input.latex);
      const updatedSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svg,
      )}`;
      return updatedSrc;
    }),
});
