// Logs to a google docs file given an:
// ID -str-, message -str-, log level -str-
function log_to_docs(document_ID, text, log_level) {
  const doc = DocumentApp.openById(document_ID)
  const body = doc.getBody()

  const time = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy HH:mm:ss')

  const log = log_level + " | " + time + " | " + text

  body.appendParagraph(log)
}