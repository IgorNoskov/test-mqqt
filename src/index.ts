import { ConsoleLogger, Hub } from '@aws-amplify/core'
import * as dotenv from 'dotenv'
import { CustomPubSub } from './CustomPubSub'
import { CONNECTION_STATE_CHANGE } from '@aws-amplify/pubsub'

dotenv.config()

if (!process.env.THING_NAME || !process.env.AUTH_TOKEN || !process.env.AUTHORIZER_NAME) {
  console.error('THING_NAME, AUTH_TOKEN or AUTHORIZER_NAME is not set in the environment variables.')
  process.exit(1)
}

ConsoleLogger.LOG_LEVEL = 'DEBUG'
ConsoleLogger.BIND_ALL_LOG_LEVELS = true

const THING_NAME = process.env.THING_NAME

const pubSubProvider = new CustomPubSub({
  endpoint: `wss://a1n4lc4bluvtif-ats.iot.us-east-1.amazonaws.com/mqtt`,
  token: process.env.AUTH_TOKEN,
  clientId: 'client-1'
})

pubSubProvider
  .subscribe({
    topics: [
      `$aws/events/presence/+/${THING_NAME}`,
      `$aws/things/${THING_NAME}/shadow/get/accepted`,
      `$aws/things/${THING_NAME}/shadow/get/rejected`,
      // `$aws/things/${THING_NAME}/shadow/name/SuvieCheckoutAppState/get/accepted`,
      // `$aws/things/${THING_NAME}/shadow/name/SuvieCheckoutAppState/get/rejected`,
    ],
    options: { qos: 1 }
  })
  .subscribe({
    next: (data) => {
      console.log(data as Record<string, unknown>)
    },
    error: (error) => console.error(error)
  })

Hub.listen('pubsub', (data) => {
  // @ts-ignore
  if (data?.payload?.event === CONNECTION_STATE_CHANGE && data?.payload?.data?.connectionState === 'Connected') {
    pubSubProvider.publish({
      topics: [
        `$aws/things/${THING_NAME}/shadow/get`,
        // `$aws/things/${THING_NAME}/shadow/name/SuvieCheckoutAppState/get`,
      ],
      message: {},
      options: { qos: 1 }
    })
      .then(() => console.log('shadow/get requested'))
      .catch(err => console.error('Publish error:', err))
  }
})
