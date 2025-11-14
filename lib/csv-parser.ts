import Papa from "papaparse";

export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data.filter((row: any) => Object.values(row).some(v => v)));
      },
      error: (error) => reject(error),
    });
  });
}

export function parseCSVAsync(file: File): Promise<any[]> {
  return parseCSV(file);
}
