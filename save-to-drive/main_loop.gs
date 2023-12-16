let folder_count = 0
let saved_file
let found
let log_text

function GmailToDrive() {
  // Logging
  log_text = "Initiating appscript daily run."
  log_to_docs(docs_ID, log_text, "INFO   ")

  // Search query in gmail inbox. Filters for emails that have NOT been scanned prior, and contain a PDF/XLSX
  const query = 'in:inbox (label:发票 AND NOT label:En Drive) filename:pdf OR filename:xlsx'
  const threads = GmailApp.search(query)

  // Preparing some objects
  const label = get_gmail_label('En Drive')
  const parent_folder = get_folder(folder_name)

  // For each email found with the query,
  threads.forEach(thread => {
    const mesgs = thread.getMessages()
    mesgs.forEach(msg => {
      //get attachments of the message
      const attachments = msg.getAttachments()
      const date = msg.getDate()
      const month = (date.getMonth() + 1).toString() + ' ' + month_names[date.getMonth() + 1] //gets month name and formats it
      const year = date.getFullYear().toString().split(".")[0] //gets year (ex. "2023")

      // For each of the attachments in the email,
      attachments.forEach(attachment => {

        // Find the folder with the corresponding year.
        const year_children = parent_folder.searchFolders('')
        found = false
        while (year_children.hasNext()) {
          const child_folder = year_children.next()
          if (child_folder.getName() === year) {
            found = true
            var folder = child_folder
          }
        }

        // If it didn't find the folder, throw error
        if (!found) {
          log_text = "Year folder " + year + " was not found in the parent folder " + parent_folder.getName() + ". Program will exit."
          log_to_docs(docs_ID, log_text, "ERROR  ")

          throw new Error('Year folder not found ' + year)
        }

        // Next, find the folder with the corresponding month. We will save attachments here.
        const month_children = folder.searchFolders('')
        found = false
        while (month_children.hasNext()) {
          const child_folder = month_children.next()
          if (child_folder.getName() === month) {
            found = true
            var folder = child_folder
          }
        }

        // If it didn't find the folder, throw error
        if (!found) {
          log_text = "Month folder " + month + " was not found in the parent folder " + folder.getName() + ". Program will exit."
          log_to_docs(docs_ID, log_text, "ERROR  ")

          throw new Error('Month folder not found ' + month)
        }

        // Year and month were both found: great! let's save it there.
        saved_file = false
        saveAttachment_(attachment, folder)
      })
    })

    // If the file has been successfully saved, tag the email so it doesn't get scanned again next time.
    if (saved_file) {
      thread.addLabel(label)
    }
  })

  log_text = "Script concluded without errors."
  log_to_docs(docs_ID, log_text, "INFO   ")
}