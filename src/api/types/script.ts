export type ScriptExportItem = {
  format: string;
  dialect?: string;
  language: string;
  title: string;
  fileName: string;
  content: string;
};

export type ScriptExportResult = {
  currentDialect: string;
  selectedDialect: string;
  items: ScriptExportItem[];
};
