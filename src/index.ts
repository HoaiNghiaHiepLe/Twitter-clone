type Handle = () => Promise<string>

const name: string = 'Hiep le'

const person: { name: string } = { name: name }

const handle: Handle = async () => Promise.resolve(name)

handle().then(console.log)
