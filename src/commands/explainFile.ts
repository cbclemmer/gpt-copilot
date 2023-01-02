import { IOpenAIWrapper } from '../OpenAIWrapper'
import { IEditor } from '../Editor'
import { syncFile } from './syncFile'

export const explainFileCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  await syncFile(editor, openAiApi)
  const filePath = editor.getCurrentFilePath()
  if (filePath == null) {
    editor.showErrorMessage('Could not get current file name')
    return
  }
  
  if (filePath.length > 0) {
    const prompt = `Explain the following ${editor.getCurrentFileExtension()} code: ${filePath}`
    const response = await openAiApi.makeRequestWithLoadingIndicator(prompt, editor)
    if (response !== undefined) {
      editor.writeToConsole(response)
    }
  } else {
    void editor.showErrorMessage('The file is empty')
  }
}
