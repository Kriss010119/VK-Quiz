import { useLocation } from 'react-router-dom';

export type SectionType = 'waiting' | 'your' | 'likes';

export const useSectionFromUrl = (): SectionType => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return (params.get('section') || 'waiting') as SectionType;
};

export const getSectionTitle = (section: SectionType): string => {
  switch (section) {
    case 'waiting': return 'WAITING QUIZZES';
    case 'your': return 'YOUR QUIZZES';
    case 'likes': return 'YOUR LIKES';
    default: return 'QUIZZES';
  }
};