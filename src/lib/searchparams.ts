import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  gender: parseAsString,
  category: parseAsString,
  role: parseAsString,
  status: parseAsString,
  sort: parseAsString,
  // engagement page
  unit: parseAsString,
  platform: parseAsString,
  post: parseAsString,
  division: parseAsString,
  // engagement SLC detail page (division above is reused as a multi-select list)
  action: parseAsString,
  satuan: parseAsString
  // advanced filter
  // filters: getFiltersStateParser().withDefault([]),
  // joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and')
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
