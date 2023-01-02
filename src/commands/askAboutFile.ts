import { IOpenAIWrapper } from '../OpenAIWrapper'
import { IEditor } from '../Editor'
import { syncFile } from './syncFile'

export const askAboutFileCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  await syncFile(editor, openAiApi)
  const filePath = editor.getCurrentFilePath()
  if (filePath == null) {
    editor.showErrorMessage('Could not get current file name')
    return
  }
  const userQuestion = await editor.getUserInput('Enter your question', 'What does this code do?', 'Invalid question')
  if (filePath.length > 0 && userQuestion !== undefined) {
    const prompt = `${userQuestion}. look in file: ${filePath}`
    const response = await openAiApi.makeRequestWithLoadingIndicator(prompt, editor)
    if (response !== undefined) {
      editor.writeToConsole(response)
    }
  } else {
    editor.showErrorMessage('File is empty')
  }
}
