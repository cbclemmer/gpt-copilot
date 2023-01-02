import { IOpenAIWrapper } from '../OpenAIWrapper'
import { IEditor } from '../Editor'
import { syncFile } from './syncFile'

export const explainSelectionCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  await syncFile(editor, openAiApi)
  const filePath = editor.getCurrentFilePath()
  if (filePath == null) {
    editor.showErrorMessage('Could not get current file name')
    return
  }

  const highlighted = editor.getHighlightedText()
  if (highlighted.length > 0) {
    const prompt = `
      Using this language: "${editor.getCurrentFileExtension()}"
      Explain this code: 
      """
      ${highlighted}
      """
      For this file: ${filePath}`
    
    const response = await openAiApi.makeRequestWithLoadingIndicator(prompt, editor)
    if (response !== undefined) {
      editor.writeToConsole(response)
    }
  } else {
    void editor.showErrorMessage('No text highlighted')
  }
}
