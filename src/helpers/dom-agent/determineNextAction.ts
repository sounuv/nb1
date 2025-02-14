import { useAppState } from "../../state/store";
import { availableActions } from "./availableActions";
import { ParsedResponseSuccess, parseResponse } from "./parseResponse";
import { QueryResult } from "../vision-agent/determineNextAction";
import errorChecker from "../errorChecker";
import { fetchResponseFromModel } from "../aiSdkUtils";

type Action = NonNullable<QueryResult>["action"];

const formattedActions = availableActions
  .map((action, i) => {
    const args = action.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ");
    return `${i + 1}. ${action.name}(${args}): ${action.description}`;
  })
  .join("\n");

async function fetchUserData(): Promise<Record<string, unknown>> {
  const response = await fetch(
    "https://n8n-webhooks.bluenacional.com/webhook/nb1/api/user/data",
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}

const systemMessage = async () => {
  const userData = await fetchUserData();
  return `
  You are a browser automation assistant.
  
  You can use the following tools:
  
  ${formattedActions}
  
  You will be given a task to perform and the current state of the DOM.
  You will also be given previous actions that you have taken. You may retry a failed action up to one time.

  When an e-mail is required, you must always use "${userData.email}".
  
  If at any point you encounter a form that requires credit card details, you must always use the following information:
  
  ${JSON.stringify(userData, null, 2)}

  Your "thought" must always be in the same language as the user's input.
  
  There are examples of actions:
  
  Example 1:
  {
    thought: "I am clicking the add to cart button",
    action: "click(223)"
  }
  
  Example 2:
  {
    thought: "I am typing 'fish food' into the search bar",
    action: "setValue(123, 'fish food')"
  }
  
  Example 3:
  {
    thought: "I continue to scroll down to find the section",
    action: "scroll('down')"
  }
  
  Example 4 (when encountering a payment form):
  {
    thought: "I am entering the cardholder's name",
    action: "setValue(creditCardNameField, '${userData.name}')"
  }
  
  Example 5 (when entering card details):
  {
    thought: "I am typing the credit card number",
    action: "setValue(creditCardNumberField, '${userData.credit_card_number}')"
  }
  
  Your response must always be in JSON format and must include "thought" and "action".
  When finished, use "finish()" in "action" and include a brief summary of the task in "thought".
  `;
};

export async function determineNextAction(
  taskInstructions: string,
  previousActions: Action[],
  simplifiedDOM: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
): Promise<QueryResult> {
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await fetchResponseFromModel(model, {
        systemMessage: await systemMessage(),
        prompt,
        jsonMode: true,
      });

      const rawResponse = completion.rawResponse;

      try {
        const parsed = await parseResponse(rawResponse);
        if ("error" in parsed) {
          throw new Error(parsed.error);
        }
        return {
          usage: completion.usage,
          prompt,
          rawResponse,
          // TODO: refactor dom agent so we don't need this
          action: visionActionAdapter(parsed),
        };
      } catch (e) {
        console.error("Failed to parse response", e);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof Error) {
        const recoverable = errorChecker(error, notifyError);
        if (!recoverable) {
          throw error;
        }
      } else {
        console.error("Unexpected determineNextAction error:");
        console.error(error);
      }
    }
  }
  const errMsg = `Failed to complete query after ${maxAttempts} attempts. Please try again later.`;
  if (notifyError) {
    notifyError(errMsg);
  }
  throw new Error(errMsg);
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: Action[],
  pageContents?: string,
) {
  let previousActionsString = "";

  if (previousActions.length > 0) {
    const serializedActions = previousActions
      .map(
        (action) =>
          `Thought: ${action.thought}\nAction:${JSON.stringify(
            action.operation,
          )}`,
      )
      .join("\n\n");
    previousActionsString = `You have already taken the following actions: \n${serializedActions}\n\n`;
  }

  let result = `The user requests the following task:

${taskInstructions}

${previousActionsString}

Current time: ${new Date().toLocaleString()}
`;
  if (pageContents) {
    result += `
Current page contents:
${pageContents}`;
  }
  return result;
}

// make action compatible with vision agent
// TODO: refactor dom agent so we don't need this
function visionActionAdapter(action: ParsedResponseSuccess): Action {
  const args = { ...action.parsedAction.args, uid: "" };
  if ("elementId" in args) {
    args.uid = args.elementId;
  }
  return {
    thought: action.thought,
    operation: {
      name: action.parsedAction.name,
      args,
    } as Action["operation"],
  };
}
