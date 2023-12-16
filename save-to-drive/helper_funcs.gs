// Saves an attachment -- pdf or xlsx -- into a folder

function saveAttachment_(attachment, folder) {
  //Check if attached file is xlsx file OR a pdf file
  if (attachment.getName().toLowerCase().endsWith(".xlsx") || attachment.getName().toLowerCase().endsWith(".pdf")) {
    saved_file = true

    log_text = "Attempting to save file " + attachment.getName() + " to folder " + folder.getName() + "..."
    log_to_docs(docs_ID, log_text, "INFO L ")

    const attachmentBlob = attachment.copyBlob()

    //Check if filename exist in the drive folder then remove the file
    const files = folder.getFilesByName(attachment.getName())
    while (files.hasNext()) {
      const file = files.next()

      log_text = "File " + attachment.getName() + " already exists in target folder " + folder.getName() + ". Replacing file."
      log_to_docs(docs_ID, log_text, "WARNING")
      //Remove existing file
      file.setTrashed(true)
    }

    //Create a new file in the drive folder
    folder.createFile(attachmentBlob)

    log_text = "File " + attachment.getName() + " was successfully saved in " + folder.getName() + "."
    log_to_docs(docs_ID, log_text, "INFO L ")
  }
}

function get_gmail_label(name) {
  const label = GmailApp.getUserLabelByName(name)
  if (!label) {
    label = GmailApp.createLabel(name)
  }
  return label
}

//This function will get the parent folder in Google drive
function get_folder(folderName) {
  let folder
  const fi = DriveApp.getFoldersByName(folderName)
  if (fi.hasNext()) {
    folder = fi.next()
  }
  else {
    log_text = "Parent folder " + folderName + " not found. Check that the parent folder still exists in drive."
    log_to_docs(docs_ID, log_text, "ERROR  ")

    throw new Error("Folder not found " + folderName)
  }
  return folder
}