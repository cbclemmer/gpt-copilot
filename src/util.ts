import { exec } from 'child_process';
import * as fs from 'fs'

export async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function getLastCommitHash(): Promise<string> {
    return await executeCommand(`git log -1 | awk 'NR==1{ print $2}'`)
}

export async function getFileContentsAtLastCommit(file: string): Promise<string | null> {
    const hash = await getLastCommitHash()
    const output = await executeCommand(`git show ${hash}:${file}`)
    return output.includes(hash)
        ? null
        : output
}

export async function getFileDifferenceFromCommit(file: string, hash: string): Promise<string> {
  const lastHash = await getLastCommitHash()
  return await executeCommand(`git diff ${hash} ${lastHash} ${file}`)
}

export async function getValueFromJsonFile(filePath: string, key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      reject(error);
    } else {
      try {
        const val: string = JSON.parse(data)[key];
        resolve(val);
      } catch (parseError) {
        reject(parseError);
      }
    }
    });
  });
}

async function saveValueToJsonFile(filePath: string, key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (readError, data) => {
      if (readError) {
        if (readError.code === 'ENOENT') {
          // File does not exist, create a new one with the given key/value pair
          const json = { [key]: value };
          fs.writeFile(filePath, JSON.stringify(json), 'utf8', (writeError) => {
            if (writeError) {
              reject(writeError);
            } else {
              resolve();
            }
          });
        } else {
          reject(readError);
        }
      } else {
        // File exists, update the value for the given key
        try {
          const json = JSON.parse(data);
          json[key] = value;
          fs.writeFile(filePath, JSON.stringify(json), 'utf8', (writeError) => {
            if (writeError) {
              reject(writeError);
            } else {
              resolve();
            }
          });
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

export async function getFileHash(path: string): Promise<string | null> {
  try {
    return await getValueFromJsonFile('openAiSyncData.json', path)
  } catch (e) {
    return null
  }  
}

export async function updateFileHash(path: string, hash: string): Promise<void> {
  try {
    await saveValueToJsonFile('openAiSyncData.json', path, hash)
  } catch (e) {
    return
  }
}