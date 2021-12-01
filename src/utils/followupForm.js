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
      const sourceQuestion = sourceQuestions.find(
        (q) => source_model === q.model
      );

      // DEEP COPY SOURCE QUESTION
      let result = cloneDeep(sourceQuestion);

      // RESET
      delete result.condition;
      delete result.help_text;
      delete result.read_only;
      delete result.required;

      // Reset for SubForm
      if (sourceQuestion.component === "SubForm") {
        delete result.repeat_button_title;
      }

      // OVERWRITE
      result = {
        ...result,

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

    if (sourceResponse[source_model] !== undefined) {
      if (question.component === "SubForm" && "questions" in question) {
        result[question.model] = sourceResponse[source_model].map((response) =>
          mergeResponses(question.questions, response)
        );
      } else {
        result[model] = sourceResponse[source_model];
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
