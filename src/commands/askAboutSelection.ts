import { IOpenAIWrapper } from '../OpenAIWrapper'
import { IEditor } from '../Editor'
import { syncFile } from './syncFile'

export const askAboutSelectionCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  await syncFile(editor, openAiApi)
  const filePath = editor.getCurrentFilePath()
  if (filePath == null) {
    editor.showErrorMessage('Could not get current file name')
    return
  }
  const highlighted = editor.getHighlightedText()
  const userQuestion = await editor.getUserInput('Enter your question', 'What does this code do?', 'Invalid question')
  if (highlighted.length > 0 && userQuestion !== undefined) {
    const prompt = `
    Answer this question: ${userQuestion}
    About this code: ${highlighted}
    In this file: ${filePath}
    `
    const response = await openAiApi.makeRequestWithLoadingIndicator(prompt, editor)
    if (response !== undefined) {
      editor.writeToConsole(response)
    }
  } else {
    void editor.showErrorMessage('No text highlighted')
  }
}
