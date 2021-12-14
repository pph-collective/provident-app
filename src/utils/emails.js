import sanitizeHtml from "sanitize-html";

// add the fancier template around the content and sanitize the html
export const processEmailBody = (body) => {
  const sanitized = sanitizeHtml(body);
  return `<table><tr><td>${sanitized}</td></tr><tr><td><div style="max-width: 175px; margin-top: 20px; margin-bottom: 5px;"><img style="width: 100%" src="https://provident.preventoverdoseri.org/assets/images/pori-provident-text-logo.png" alt="PROVIDENT logo"></img></div><a href="https://join.slack.com/t/dataacademytalk/shared_invite/zt-yv25w5bq-d6xR3SCXjjR0XoJi__mdmg">Join our Slack!</a></td></tr></table>`;
};

export default {
  processEmailBody,
};
