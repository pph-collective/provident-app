import { cloneDeep } from "./utils";

export const getFollowupDate = (date, count, unit) => {
  const oldDate = new Date(date);

  switch (unit) {
    case "month":
      return new Date(oldDate.setMonth(oldDate.getMonth() + count))
        .toISOString()
        .split("T")[0];
    case "week":
      return new Date(oldDate.setDate(oldDate.getDate() + 7 * count))
        .toISOString()
        .split("T")[0];
    case "day":
      return new Date(oldDate.setDate(oldDate.getDate() + count))
        .toISOString()
        .split("T")[0];
    default:
      return date;
  }
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
