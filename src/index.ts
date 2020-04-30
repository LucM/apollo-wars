import { ApolloServer } from 'apollo-server';
import { createContext, Context } from './context';
import { FieldDirective } from './fieldDirective';
import fs from 'fs';

const personSelected: any[] = [];

const resolvers = {
  Query: {
    person: (parent: any, { id }: { id: number }, ctx: Context) => ctx.api.load(`people/${id}`),
    persons: async (parent: any, { selected = false }: { selected: boolean }, ctx: Context) => {
      if (selected) return personSelected;
      const result: any = await ctx.api.load(`people`);
      return result.results;
    },
    movie: (parent: any, { id }: { id: number }, ctx: Context) => ctx.api.load(`films/${id}`),
    movies: async (parent: any, args: undefined, ctx: Context) => {
      const result: any = await ctx.api.load(`films`);
      return result.results;
    },
    planet: (parent: any, { id }: { id: number }, ctx: Context) => ctx.api.load(`planet/${id}`),
    planets: async (parent: any, args: undefined, ctx: Context) => {
      const result: any = await ctx.api.load(`planets`);
      return result.results;
    },
  },
  Mutation: {
    selectPerson: async (parent: any, { id }: { id: number }, ctx: Context) => {
      let person: any;
      try {
        person = await ctx.api.load(`people/${id}`);
        person.id = person.url.substr(28).replace('/', ''); // No id in swapi, look a url
      } catch (err) {
        throw new Error('user does not exist');
      }

      if (personSelected.find(({ name }) => name === person.name)) {
        throw new Error('user already selected');
      }

      personSelected.push(person);
      return personSelected;
    },
    unselectPerson: async (parent: any, { id }: { id: number }, ctx: Context) => {
      const position = personSelected.findIndex(person => person.id == id);
      if (position === -1) {
        throw new Error('user not in list');
      }
      personSelected.splice(position, 1);
      return personSelected;
    },
  },
  Person: {
    id: ({ url }: { url: string }) => url.substr(28).replace('/', ''), // No id in swapi, look a url
    movies: ({ films }: { films: string[] }, args: undefined, ctx: Context) =>
      Promise.all(films.map(film => ctx.api.load(film))),
    planet: ({ homeworld }: { homeworld: string }, args: undefined, ctx: Context) => ctx.api.load(homeworld),
  },
  Planet: {
    id: ({ url }: { url: string }) => url.substr(28).replace('/', ''), // No id in swapi, look a url
    movies: ({ films }: { films: string[] }, args: undefined, ctx: Context) =>
      Promise.all(films.map(film => ctx.api.load(film))),
  },
  Movie: {
    id: ({ url }: { url: string }) => url.substr(28).replace('/', ''), // No id in swapi, look a url
    characters: ({ characters }: { characters: string[] }, args: undefined, ctx: Context) =>
      Promise.all(characters.map(characters => ctx.api.load(characters))),
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(`${__dirname}/../schema.graphql`, 'utf-8'),
  resolvers,
  context: createContext(),
  schemaDirectives: {
    field: FieldDirective,
  },
  tracing: true,
  playground: true, // disabled by default in prod
  introspection: true, // disabled by default in prod
  formatError: err => new Error(err.message),
});
server.listen({ port: process.env.PORT || 4000 }).then(() => console.log('Server is running on localhost:4000'));
