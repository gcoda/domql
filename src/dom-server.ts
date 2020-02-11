/* eslint-disable @typescript-eslint/no-explicit-any */
// prettier-ignore
import { ApolloGateway, LocalGraphQLDataSource, RemoteGraphQLDataSource } from '@apollo/gateway'
import { buildFederatedSchema, ServiceDefinition } from '@apollo/federation'
import { GraphQLSchemaModule } from 'apollo-graphql'
import { GraphQLRequest } from 'apollo-server-types'
import { localService } from './local-service'
import gql from 'graphql-tag'

const gateway = new ApolloGateway({
  localServiceList: [
    localService,
    // remoteService
  ],

  buildService: (service: LocalService) => {
    return service.url
      ? new RemoteGraphQLDataSource({
          url: service.url,
          willSendRequest({ request, context }: RequestContext) {
            request.http?.headers.set('x-user-id', context.userId)
          },
        })
      : new LocalGraphQLDataSource(
          buildFederatedSchema([service as GraphQLSchemaModule])
        )
  },
})

const exec = (async () => {
  const { executor } = await gateway.load()
  const runQuery = async (
    document: string,
    variables: { [k: string]: any } = {}
  ) => {
    const { data, errors } = await executor({
      document: gql(document),
      request: { variables },
      queryHash: document.replace(/\s/g, ''),
      context: { document: '???' },
      cache: {} as any,
    })
    return { data, errors }
  }
  return runQuery
})()

export default exec

type LocalServiceDefinition = GraphQLSchemaModule & { name: string; url: never }
type RemoteServiceDefinition = Pick<ServiceDefinition, 'name' | 'url'>
type LocalService = RemoteServiceDefinition | LocalServiceDefinition
type RequestContext = { request: GraphQLRequest; context: Record<string, any> }
