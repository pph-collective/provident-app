import { cloneDeep } from "./utils";
import parse from "parse-duration";

export const createFollowupFormResponse = (formResponse) => {
  const { _id, form, response, last_updated } = cloneDeep(formResponse);
  const { followup_form, questions, type } = form;
  const { title, followup_interval } = followup_form;

  const newForm = {
    title,
    type,
  };

  if ("followup_form" in followup_form) {
    // If there is a follow up form, move that up a layer
    newForm["followup_form"] = followup_form["followup_form"];
  }

  newForm.questions = mergeQuestions(questions, followup_form.questions);
  const newResponse = mergeResponses(newForm.questions, response ?? {});

  return {
    previous_id: _id,
    form: newForm,
    response: newResponse,
    status: "Not Started",
    release_date: getFollowupDate(last_updated, followup_interval),
    last_updated: Date.now(),
  };
};

const getFollowupDate = (lastUpdated, followupInterval) => {
  const ms = parse(followupInterval);

  if (ms) {
    return new Date(lastUpdated + ms).toLocaleDateString("sv");
  }

  return new Date(lastUpdated).toLocaleDateString("sv");
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
      delete sourceQuestion.repeat_button_title;

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
  createFollowupFormResponse,
  getFollowupDate,
  mergeQuestions,
  mergeResponses,
};
