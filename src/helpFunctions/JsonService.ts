import * as fs from 'fs';
import * as path from 'path';
import { CyDigConfig } from '../types/CyDigConfig';

export function getContentOfFile(jsonPath: string): CyDigConfig {
  try {
    const jsonFilePath: string = path.resolve(
      __dirname,
      path.relative(__dirname, path.normalize(jsonPath).replace(/^(\.\.(\/|\\|$))+/, ''))
    );
    const fileContent: string = fs.readFileSync(jsonFilePath, { encoding: 'utf-8' });
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error('Could not find a file on the given path');
  }
}
