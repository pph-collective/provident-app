const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { ArgumentParser } = require("argparse");

const parser = new ArgumentParser({
  description: "PROVIDENT Email Service",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "check the firebase emulator for emails to send instead of the production database",
});
parser.add_argument("-t", "--test", {
  action: "store_true",
  help: "send emails to a test server and get preview links instead of the real server",
});

const { emulator, test } = parser.parse_args();

if (emulator) {
  // assumes --emulator is the arg
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}

let EMAIL_SMTP = "smtp://regmail.brown.edu:25";
if (test) {
  EMAIL_SMTP = undefined;
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials/serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

// get the emails to send from firestore
const getEmails = async () => {
  const now = new Date().toISOString();
  const res = await db
    .collection("emails")
    .where("sent", "==", false)
    .where("sendDate", "<", now)
    .get();
  const emails = [];
  res.forEach((doc) => emails.push({ id: doc.id, ...doc.data() }));
  return emails;
};

// send an email request out to the correct recipients, mark as sent
const sendEmail = async (transport, { id, subject, to, body }, users) => {
  // if all the emails failed to send, don't mark the message as sent
  let all_failed = true;

  // send mail with defined transport object
  for (const email of to) {
    try {
      if (!users.includes(email)) {
        console.log(`User doesn't exist in our database: ${email}`);
        continue;
      }

      const info = await transport.sendMail({
        from: '"PROVIDENT RI" <noreply@brown.edu>', // sender address
        to: email, // list of receivers
        subject, // Subject line
        html: body, // html body
      });

      console.log("Message sent: %s", info.messageId);

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      all_failed = false;
    } catch (e) {
      console.log("Email failed to send");
      console.log(e);
    }
  }

  // mark the message as sent
  if (!all_failed && !test) {
    await db.collection("emails").doc(id).update({ sent: true });
  }
};

const getCollectionKeys = async (collection) => {
  let res = [];
  try {
    const docs = await db.collection(collection).get();
    res = docs.docs.map((doc) => doc.id);
  } catch (err) {
    console.log(err);
  }
  return res;
};

// get the emails to be sent, set up the transporter, send all emails
const main = async () => {
  const emails = await getEmails();
  if (emails.length === 0) {
    console.log("No emails to send");
    return;
  }

  let transport;
  if (EMAIL_SMTP !== undefined) {
    transport = nodemailer.createTransport(EMAIL_SMTP);
    console.debug("initialized smtp server: %s", EMAIL_SMTP);
  } else {
    const { user, pass } = await nodemailer.createTestAccount();
    transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });
    console.debug("initialized ethereal email smtp server");
  }

  const users = await getCollectionKeys("users");

  for (let email of emails) {
    await sendEmail(transport, email, users);
  }

  console.log("Done sending emails.");
};

// can't directly call async function
main().catch(console.error);
