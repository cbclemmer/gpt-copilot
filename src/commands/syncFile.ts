import { IOpenAIWrapper } from '../OpenAIWrapper'
import { IEditor } from '../Editor'
import { getFileContentsAtLastCommit, getFileDifferenceFromCommit, getFileHash, getLastCommitHash, updateFileHash } from '../util'

export const syncFile = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  const filePath = editor.getCurrentFilePath()
  if (filePath == null) {
    editor.showErrorMessage('Cannot get current files relative path')
    return
  }
  
  const contents = await getFileContentsAtLastCommit(filePath)
  if (contents == null) {
    editor.showErrorMessage('Cannot get current files contents as of last commit')
    return
  }

  const lastCommit = await getLastCommitHash()
  const workspaceHash = await getFileHash(filePath)
  if (workspaceHash == null) {
    await openAiApi.saveNewFile(filePath, contents, editor)
    editor.showMessage('New file uploaded')
  } else {
    if (workspaceHash == lastCommit) {
      editor.showErrorMessage('File is up to date')
      return
    }
    const diff = await getFileDifferenceFromCommit(filePath, workspaceHash)
    await openAiApi.updateFile(filePath, diff, editor)
    editor.showMessage('File updated to latest commit')
  }
  await updateFileHash(filePath, lastCommit)
}
