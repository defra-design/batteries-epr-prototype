export async function initialiseServer({ mockedPlugins } = {}) {
  const { createServer } = await import('../server/server.js')
  const plugins = await import('../server/common/plugins/index.js')

  const server = await createServer({ ...plugins.default, ...mockedPlugins })

  await server.initialize()

  return server
}
