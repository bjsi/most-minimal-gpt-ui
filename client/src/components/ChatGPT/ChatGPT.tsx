import React from "react";
import MessageItem from "./MessageItem";
import SendBar, { SEND_BAR_HEIGHT } from "./SendBar";
import { useGenerateMealPlan } from "./useChatGPT";

import "highlight.js/styles/atom-one-dark.css";
import { HEADER_HEIGHT } from "../HeaderBar";
import { MealMessageItem } from "./MealMessageItem";
import {
  createMealPlanFunction,
  createMealPlanSchema,
  formatMeal,
  mealPlanFileSchema,
  partialCreateMealPlanSchema,
} from "shared-lib/src/ai/prompts/createMealPlan";
import { set, z } from "zod";
import { extractIngredients } from "shared-lib";

export const ChatGPT = () => {
  const {
    loading,
    disabled,
    messages,
    currentMessage,
    onSend,
    onClear,
    onStop,
  } = useGenerateMealPlan();

  const [mealPlan, setMealPlan] =
    React.useState<z.infer<typeof partialCreateMealPlanSchema>>();

  React.useEffect(() => {
    setMealPlan(currentMessage);
  }, [currentMessage]);

  const inputText = React.useRef<string>("");

  const [extractingIngredients, setExtractingIngredients] =
    React.useState(false);

  return (
    <div
      className="overflow-hidden chat-wrapper"
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
      }}
    >
      <div
        className="w-[100%] overflow-y-auto flex flex-col items-center"
        style={{
          minHeight: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
          maxHeight: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
          height: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
        }}
      >
        <div className="max-w-[800px] h-[100%]">
          <div className="w-[100%] max-h-[100%] h-[100%]">
            {messages.map((message, idx) => (
              <MessageItem key={idx} message={message} />
            ))}
            {mealPlan &&
              (mealPlan.recipes || []).map((recipe, idx) => (
                <MealMessageItem
                  updateRecipe={(updatedRecipe) => {
                    const newRecipes = [...(currentMessage?.recipes || [])];
                    newRecipes[idx] = updatedRecipe;
                    setMealPlan({ ...currentMessage, recipes: newRecipes });
                  }}
                  key={idx}
                  requirements={inputText.current}
                  meal={recipe}
                />
              ))}
          </div>
        </div>
      </div>

      <SendBar
        placeholder="Enter your meal plan requirements here..."
        inputText={inputText}
        loading={loading}
        disabled={disabled}
        saveDisabled={
          !createMealPlanSchema.safeParse(mealPlan).success ||
          extractingIngredients
        }
        saveLoading={extractingIngredients}
        onSend={(message) => onSend({ message, requirements: message.content })}
        onClear={onClear}
        onStop={onStop}
        onSave={async () => {
          const maybeMealPlan = createMealPlanSchema.safeParse(mealPlan);
          if (!maybeMealPlan.success) {
            console.log("Can't save incomplete meal plan");
            return;
          }

          const body = {
            mealPlans: maybeMealPlan.data.recipes
              .map((recipe) => formatMeal(recipe))
              .join("\n"),
          };

          setExtractingIngredients(true);
          const { ingredients } = await fetch(
            `http://localhost:3020/extract-ingredients`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          ).then((res) => res.json());
          setExtractingIngredients(false);

          const maybePlanData = mealPlanFileSchema.safeParse({
            requirements: inputText.current,
            meals: maybeMealPlan.data.recipes,
            ingredients,
          });

          if (!maybePlanData.success) {
            console.log("Plan data is invalid");
            return;
          }

          const json = JSON.stringify(maybePlanData.data, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "mealPlan.json";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }}
      />
    </div>
  );
};
