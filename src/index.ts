import handleRequest from './handler'

export default {
  fetch: (request: Request): Promise<Response> => handleRequest(request),
} satisfies ExportedHandler