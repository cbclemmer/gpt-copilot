
import * as vscode from 'vscode'
import { writeToConsole } from '../../console'
import { instance, mock, verify } from 'ts-mockito'

suite('Console test suite', () => {
  test('tests that the output channel is called', () => {
    let mockedOutputChannel:vscode.OutputChannel = mock<vscode.OutputChannel>()
    let channel:vscode.OutputChannel = instance(mockedOutputChannel)
    writeToConsole('Hello World', channel)
    verify(mockedOutputChannel.appendLine('Hello World')).once()
    verify(mockedOutputChannel.show()).once()
  });
});