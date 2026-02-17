import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'data/imports/raw');

export async function saveRawFile(filename: string, content: Buffer | string): Promise<string> {
    // Ensure directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const timestamp = new Date().getTime();
    const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    fs.writeFileSync(filePath, content);

    return filePath;
}
