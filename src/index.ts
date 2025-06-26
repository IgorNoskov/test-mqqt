import { ConsoleLogger } from '@aws-amplify/core'
import * as dotenv from 'dotenv'
import { CustomPubSub } from './CustomPubSub'

dotenv.config()

if (!process.env.AUTH_TOKEN) {
  console.error('AUTH_TOKEN is not set in the environment variables.')
  process.exit(1)
}

ConsoleLogger.LOG_LEVEL = 'DEBUG'
ConsoleLogger.BIND_ALL_LOG_LEVELS = true

const THING_NAME = 'kiosk-terminal-JFHCXMLW99'

const pubSubProvider = new CustomPubSub({
  endpoint: `wss://a1n4lc4bluvtif-ats.iot.us-east-1.amazonaws.com/mqtt`,
  token: process.env.AUTH_TOKEN,
  clientId: THING_NAME
})

pubSubProvider
  .subscribe({
    topics: [
      `$aws/events/presence/+/${THING_NAME}`
    ],
    options: { qos: 1 }
  })
  .subscribe({
    next: (data) => {
      console.log(data as Record<string, unknown>)
    },
    error: (error) => console.error(error)
  })

pubSubProvider.publish({
  topics: `$aws/things/${THING_NAME}/shadow/get`,
  message: {},
  options: { qos: 1 }
})
  .then(() => console.log('Requested shadow/get'))
  .catch(err => console.error('Publish error:', err))