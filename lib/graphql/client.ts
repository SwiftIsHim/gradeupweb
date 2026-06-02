import "server-only"

import { GraphQLClient } from "graphql-request"

function resolveEndpoint(): string {
  const endpoint = process.env.GRAPHQL_ENDPOINT

  if (!endpoint) {
    throw new Error(
      "GRAPHQL_ENDPOINT is not set. Add it to .env.local — e.g. https://staging-api.civilpromo.com/graphql",
    )
  }

  return endpoint
}

export function createGraphQLClient(accessToken?: string): GraphQLClient {
  return new GraphQLClient(resolveEndpoint(), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })
}

let cachedAnonClient: GraphQLClient | undefined

export function getAnonClient(): GraphQLClient {
  cachedAnonClient ??= createGraphQLClient()
  return cachedAnonClient
}
