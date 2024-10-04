import axios from 'axios';

export const result = async (operationName: string, graphqlQuery: string, variables: any) => {
  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      operationName: operationName,
      query: graphqlQuery,
      variables: variables,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': process.env.CSRF_TOKEN || '',
        Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION || ''}; csrftoken=${process.env.CSRF_TOKEN || ''
          }`,
      },
    },
  );
  return response;
};
