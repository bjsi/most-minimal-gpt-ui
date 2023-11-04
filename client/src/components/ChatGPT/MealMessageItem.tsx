import { formatMeal, partialRecipeSchema, recipeSchema } from "shared-lib";
import MessageItem from "./MessageItem";
import React from "react";
import SendBar from "./SendBar";
import { z } from "zod";
import { formatMealImagePrompt, useGenerateImage } from "./useGenerateImage";
import { useUpdateRecipe } from "./useChatGPT";
import { Ingredient } from "shared-lib/src/ai/prompts/extractIngredients";

interface MealMessageItemProps {
  requirements: string;
  meal: z.infer<typeof partialRecipeSchema>;
  updateRecipe: (meal: z.infer<typeof partialRecipeSchema>) => void;
  deleteRecipe: () => void;
}

export function MealMessageItem(props: MealMessageItemProps) {
  const { meal } = props;
  const isComplete = recipeSchema.safeParse(props.meal).success;
  React.useEffect(() => {
    if (isComplete) {
      // generate easy feedback buttons based on meal and requirements
    }
  }, [isComplete]);

  const { image, loading, requestImage } = useGenerateImage();
  React.useEffect(() => {
    if (meal.instructions && !image && !loading) {
      const prompt = formatMealImagePrompt(
        meal.name!,
        meal.ingredients as Ingredient[]
      );
      requestImage(prompt);
    }
  }, [meal.instructions]);

  const {
    onSend,
    onStop,
    loading: recipeLoading,
    disabled,
    currentMessage: updatedRecipe,
  } = useUpdateRecipe();

  React.useEffect(() => {
    if (updatedRecipe) {
      props.updateRecipe(updatedRecipe);
    }
  }, [updatedRecipe]);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-md hover:bg-black hover:bg-opacity- w-[700px]">
      <div className="grid items-center grid-cols-2 gap-4">
        <MessageItem
          message={{
            role: "assistant",
            content: formatMeal(meal),
          }}
        />
        <div className="flex items-center justify-center">
          {image && (
            <img
              className="object-cover rounded-md shadow-sm w-50 h-50"
              alt={"AI Generated Meal Image"}
              src={"data:image/png;base64," + image}
            />
          )}
        </div>
      </div>
      <SendBar
        placeholder="Give feedback on this meal..."
        loading={recipeLoading}
        disabled={disabled || !isComplete}
        onSend={(message) =>
          onSend({
            message,
            feedback: message.content || "",
            mealPlan: JSON.stringify({
              meal,
            }),
          })
        }
        onClear={props.deleteRecipe}
        onStop={onStop}
      />
    </div>
  );
}
