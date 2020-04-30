import { swapi } from './swapi';
import { AxiosResponse } from 'axios';
import DataLoader from 'dataloader';

export type Context = {
  api: {
    load: (path: string) => Promise<AxiosResponse<any>>;
  };
};

export const createContext = (): Context => {
  console.log('New query:');
  const api = new DataLoader<string, any, any>(async urls => {
    const uniqueUrls = [...new Set(urls)];
    const results = await Promise.all(
      uniqueUrls.map(async url => {
        const result = await swapi(url);
        return { result, url };
      }),
    );
    const resultMap: any = results.reduce((acc, r) => ({ ...acc, [r.url]: r.result }), {});
    return urls.map(url => resultMap[url]);
  });

  return {
    api,
  };
};
