import React from "react";
import { ingredientSchema } from "shared-lib";
import { z } from "zod";

export const formatMealImagePrompt = (
  name: string,
  ingredients: z.infer<typeof ingredientSchema>[]
) => {
  return `
Generate a picture of this meal for a recipe book:
${name}
Ingredients:
${ingredients.map((ingredient) => "- " + ingredient.name).join("\n")}
`.trim();
};

export function useGenerateImage() {
  const [loading, setLoading] = React.useState(false);
  const [image, setImage] = React.useState<string | null>(null);
  const controller = React.useRef<AbortController | null>(null);

  const requestImage = async (prompt: string) => {
    try {
      controller.current = new AbortController();
      setLoading(true);
      const response = await fetch(`http://localhost:3020/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.current.signal,
      });
      setImage(await response.text());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, image, requestImage };
}
