// CSV parsing utilities
export const parseCSV = (content: string): string[] => {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

export const downloadCSVTemplate = (): void => {
  const template = "url\nhttps://example.com\nhttps://another-example.com";
  const blob = new Blob([template], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "urls-template.csv";
  a.click();
  URL.revokeObjectURL(url);
};
