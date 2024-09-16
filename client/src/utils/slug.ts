import slugify from 'slugify';

export const createSlug = (str: string) => {
  return slugify(str, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-',
  });
};
