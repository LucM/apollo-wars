import axios from 'axios';

export const swapi = async (path: string) => {
  const url = path.substr(0, 4) === 'http' ? path : `https://swapi.dev/api/${path}`;
  const res = await axios.get(url);
  console.log(url);
  return res.data;
};
