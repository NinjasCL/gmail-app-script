// Made by Camilo Castro <camilo@ninjas.cl>
// July 2020
// Use this in a Google Apps Script https://script.google.com
// Configure Access to Gmail API first
// https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services

// Have a sane max of items to process.
const MAX_THREADS = 30;

const HTTP_ENDPOINT = "http://example.com/save-emails-endpoint";

// This token should be generated
// and stored in server and client
// use: make token
// to get a new uuid
const HTTP_AUTH_TOKEN = "8D271224-9A7C-4AC2-8C11-E7E7443C9DAB";

// Create a new filter in gmail to assign labels to new email messages
const LABEL_NAME = "my-label";

const processEmails = () => {
  const sendDetailsToServer = (data) => {
    const url =
      `${HTTP_ENDPOINT}?token=${HTTP_AUTH_TOKEN}&json=` +
      encodeURIComponent(JSON.stringify(data));

    Logger.log("Calling", url);

    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    Logger.log(response);

    return response;
  };

  const getMessages = () => {
    const label = GmailApp.getUserLabelByName(LABEL_NAME);

    if (!label) {
      Logger.log("No label named", LABEL_NAME);
      return [];
    }

    const threads = GmailApp.search(
      `is:unread label:"${LABEL_NAME}"`,
      0,
      MAX_THREADS
    );

    Logger.log(threads.length, "Threads found");

    const emails = [];
    for (const thread of threads) {
      const messages = thread.getMessages();

      for (const message of messages) {
        if (message.isUnread()) {
          const email = {
            subject: message.getSubject(),
            body: message.getPlainBody(),
            from: message.getFrom(),
            date: message.getDate(),
          };

          emails.push({ email, message });
        }
      }
    }
    return emails;
  };

  const messages = getMessages();
  for (const message of messages) {
    sendDetailsToServer(message.email);
    GmailApp.markMessageRead(message.message);
  }
};
