declare const __API_URL__: string | undefined;

export const API_URL: string =
  typeof __API_URL__ !== 'undefined' && __API_URL__ ? __API_URL__ : 'http://localhost:3000/api';
