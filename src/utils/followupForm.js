import { cloneDeep } from "./utils";
import parse from "parse-duration";

export const getFollowupDate = (lastUpdated, followupInterval) => {
  const ms = parse(followupInterval);

  if (ms) {
    return new Date(lastUpdated + parse(followupInterval))
      .toISOString()
      .split("T")[0];
  }

  return lastUpdated;
};

const mergeQuestions = (sourceQuestions, followupQuestions) => {
  return followupQuestions.map((followupQuestion) => {
    const { source_model } = followupQuestion;

    if (source_model !== undefined) {
      // DEEP COPY SOURCE QUESTION
      const sourceQuestion = cloneDeep(
        sourceQuestions.find((q) => source_model === q.model)
      );

      // RESET
      delete sourceQuestion.condition;
      delete sourceQuestion.help_text;
      delete sourceQuestion.read_only;
      delete sourceQuestion.required;

      // Reset for SubForm
      if (sourceQuestion.component === "SubForm") {
        delete sourceQuestion.repeat_button_title;
      }

      // OVERWRITE
      const result = {
        ...sourceQuestion,

        // Overwrite fields with the followup question
        ...followupQuestion,
      };

      if (
        sourceQuestion.component === "SubForm" &&
        "questions" in followupQuestion
      ) {
        result.questions = mergeQuestions(
          sourceQuestion.questions,
          followupQuestion.questions
        );
      }

      return result;
    } else {
      return followupQuestion;
    }
  });
};

const mergeResponses = (newQuestions, sourceResponse) => {
  const result = {};

  for (const question of newQuestions) {
    const { source_model, model } = question;
    const sourceQuestionResponse = sourceResponse[source_model];

    if (sourceQuestionResponse) {
      if (question.component === "SubForm" && question.questions) {
        result[model] = sourceQuestionResponse.map((response) =>
          mergeResponses(question.questions, response)
        );
      } else {
        result[model] = sourceQuestionResponse;
      }
    }
  }

  return result;
};

export default {
  getFollowupDate,
  mergeQuestions,
  mergeResponses,
};
