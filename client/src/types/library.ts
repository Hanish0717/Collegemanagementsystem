export interface BookRecord {
  _id?: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies: number;
  language?: string;
  shelfNumber?: string;
  description?: string;
}
