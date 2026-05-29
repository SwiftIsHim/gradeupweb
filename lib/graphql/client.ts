import "server-only"

import { GraphQLClient } from "graphql-request"

const endpoint = process.env.GRAPHQL_ENDPOINT

if (!endpoint) {
  throw new Error(
    "GRAPHQL_ENDPOINT is not set. Add it to .env.local — e.g. https://staging-api.civilpromo.com/graphql",
  )
}

export const graphqlEndpoint = endpoint

export function createGraphQLClient(accessToken?: string): GraphQLClient {
  return new GraphQLClient(endpoint!, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })
}

export const anonClient = createGraphQLClient()
