import { Configuration, OpenAIApi } from 'openai'
import * as vscode from 'vscode'
import { IEditor } from './Editor'

export interface IOpenAIWrapper {
  makeRequestWithLoadingIndicator: (text: string, editor: IEditor) => Promise<string | undefined>
  makeRequest: (text: string, editor: IEditor) => Promise<string | undefined>
  saveNewFile: (filePath: string, fileContents: string, editor: IEditor) => Promise<string | undefined>
  updateFile(filePath: string, fileDiff: string, editor: IEditor): Promise<string | undefined>
}

export class OpenAIWrapper implements IOpenAIWrapper {
  async makeRequestWithLoadingIndicator (text: string, editor: IEditor): Promise<string | undefined> {
    let response: string | undefined
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'Loading response...'
    }, async (progress) => {
      progress.report({ increment: 0 })
      response = await this.makeRequest(text, editor)
      progress.report({ increment: 100 })
    })
    return response
  }

  async makeRequest (text: string, editor: IEditor): Promise<string | undefined> {
    const config = new Configuration({
      apiKey: await editor.getSecret('openai-api-key'),
      organization: editor.getConfigValue('organization')
    })
    const openai = new OpenAIApi(config)
    if (!vscode.workspace.workspaceFolders) return undefined

    const response = await openai.createCompletion({
      prompt: text,
      max_tokens: 2000,
      temperature: .5,
      model: 'text-davinci-003',
      n: 1,
      stream: false
    })
    return response.data.choices[0].text
  }

  async saveNewFile(filePath: string, fileContents: string, editor: IEditor): Promise<string | undefined> {
    const text = `
      This is a new file: ${filePath}
      Here is the contents of the file:
      ${fileContents}
    `
    return await this.makeRequestWithLoadingIndicator(text, editor)
  }

  async updateFile(filePath: string, fileDiff: string, editor: IEditor): Promise<string | undefined> {
    const text = `
    The contents of ${filePath} have been updated
    This is the difference:
    ${fileDiff}
    `
    return await this.makeRequestWithLoadingIndicator(text, editor)
  } 
}
