# graphql-to-ts-cli

CLI for generating TypeScript interfaces and ApolloClient methods from GraphQL schema. Uses the companion project 'graphql-to-ts'.

## Installation

```bash
npm i graphql-to-ts-cli
```

## Usage

### Generating basic types.

You need a GraphQL schema file (say input.js) in the following format.

```ts
export default `
  type Permission {
    rowid: ID!
    assigner: ScuttlespaceUser!
    assignee: ScuttlespaceUser!
    permissions: String
  }
  type ScuttlespaceUser {
    about: String
    domain: String
    enabled: Boolean!
    externalId: String!
    pub: String!
    rowid: ID!
    username: String!
    permissions: [Permission]
  }  
`;
```

The following command will write TypeScript interfaces (IPermission and IScuttlespaceUser) to a file named output.ts.

```bash
graphql-to-ts types -i input.js -o output.ts
```

### Generating resolvers

Again, you need a GraphQL file (say input.js) in the following format, having the types Query and Mutation defined.

```ts
export default `
  // Many types omitted for brevity...

  type ChangeUserStatusResult {
    username: String!
  }

extend type Query {
    user(domain: String, externalId: String, username: String): ScuttlespaceUser
  }
`;
```

The following command will write GraphQL resolvers to a file named output.ts.

```bash
graphql-to-ts resolvers
  -i input.js \
  -o output.ts \
  --apimodule my-api-module \
  --graphqlmodule my-graphql-module \
  --parsefuncmodule result-parsers \
  --parsefuncname parseResult
```

apimodule, graphqlmodule and parsefuncmodule are modules which are imported in the output, which is as follows.

```ts
import { parseResult } from "result-parsers";
import {
  IChangeUserStatusArgs,
  IChangeUserStatusResult,
  ICreateOrRenameUserArgs,
  ICreateOrRenameUserResult,
  IPermission,
  IScuttlespaceUser
} from "my-graphql-module";
import { user } from "./my-api-module";

// .... omitted
export default {
  Query: {
    async user(
      root: any,
      args: {
        domain: string | null;
        externalId: string | null;
        username: string | null;
      },
      context: any
    ): Promise<IScuttlespaceUser | null> {
      const result = await user(args, context);
      return await parseResult(result);
    }
  }
};
```

### Generating queries

Write your queries (in say queries.js) in the following format.

```ts
export default `
  query GetUser($domain: String, $externalId: String, $username: String) {
    user(domain: $domain, externalId: $externalId, username: $username)
  }
`;
```

The following command will generate Apollo Client Queries. You need to provide the schema file as well, which is the same file you used for the above commands (types and resolvers).

```bash
graphql-to-ts apolloqueries -i queries.js --schema schema.js --gqltypesmodule my-gql-types -o output.ts
```

Output looks like this

```ts
export async function invokeGetUser(
  domain: string | undefined,
  externalId: string | undefined,
  username: string | undefined,
  apolloClient: ApolloClient<any>
): Promise<{
  user: IScuttlespaceUser | null;
}> {
  try {
    const result = await apolloClient.query({
      query: gql(invokeGetUserGQL),
      variables: {
        domain,
        externalId,
        username
      }
    });
    return result.data as any;
  } catch (ex) {
    throw ex;
  }
}
```
