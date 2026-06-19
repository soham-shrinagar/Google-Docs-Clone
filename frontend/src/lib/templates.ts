export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  title: string;
}

export const TEMPLATE_CATEGORIES = ['All', 'General', 'Work', 'Career', 'Content', 'Marketing', 'Business', 'Creative'];
