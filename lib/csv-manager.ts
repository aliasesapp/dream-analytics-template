import fs from 'fs';
import path from 'path';

const CSV_DIR = path.join(process.cwd(), 'public');

export interface CSVFile {
  id: string;
  name: string;
  path: string;
}

export async function getCSVFiles(): Promise<CSVFile[]> {
  if (!fs.existsSync(CSV_DIR)) {
    fs.mkdirSync(CSV_DIR, { recursive: true });
  }

  const files = await fs.promises.readdir(CSV_DIR);
  return files
    .filter(file => file.endsWith('.csv'))
    .map(file => ({
      id: path.parse(file).name,
      name: file,
      path: path.join(CSV_DIR, file),
    }));
}

export async function addCSVFile(file: File): Promise<CSVFile> {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(CSV_DIR, fileName);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(filePath, buffer);

  return {
    id: path.parse(fileName).name,
    name: fileName,
    path: filePath,
  };
}

export async function removeCSVFile(id: string): Promise<void> {
  const files = await getCSVFiles();
  const file = files.find(f => f.id === id);
  if (file) {
    await fs.promises.unlink(file.path);
  }
}
