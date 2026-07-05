export const formatDate = (dateString: string, locale: string = 'ru-RU'): string => {
  return new Date(dateString).toLocaleDateString(locale);
};

export const getCurrentDate = (locale: string = 'ru-RU'): string => {
  return new Date().toLocaleDateString(locale);
};