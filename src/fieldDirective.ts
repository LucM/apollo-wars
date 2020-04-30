import { SchemaDirectiveVisitor } from 'apollo-server';
import { GraphQLField } from 'graphql';

// More info: https://www.apollographql.com/docs/graphql-tools/schema-directives/
export class FieldDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { name } = this.args;
    field.resolve = parent => parent[name];
  }
}
