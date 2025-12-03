import { MailtrapClient } from "mailtrap";

if (!process.env.MAILTRAP_API_KEY) {
  throw new Error("MAILTRAP_API_KEY no está configurado");
}

const testInboxId = Number(process.env.MAILTRAP_TEST_INBOX_ID);

if (isNaN(testInboxId)) {
  throw new Error("MAILTRAP_TEST_INBOX_ID no está configurado correctamente");
}

export const mailtrap = new MailtrapClient({
  testInboxId,
  sandbox: true,
  token: process.env.MAILTRAP_API_KEY,
});
