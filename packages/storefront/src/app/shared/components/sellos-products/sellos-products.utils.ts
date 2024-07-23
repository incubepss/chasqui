import { hardcodedDescriptions } from '../sello/sello-description';

export const getSelloDescription = (code: string) => {
  return hardcodedDescriptions.find(description => description.code === code) || '';
};
