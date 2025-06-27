import { PubSub, PubSubOptions } from '@aws-amplify/pubsub'
import * as dotenv from 'dotenv'

dotenv.config()

const AUTHORIZER_NAME = process.env.AUTHORIZER_NAME

export class CustomPubSub extends PubSub {
  private readonly token: string

  constructor(options: PubSubOptions & { token: string }) {
    super(options)

    this.token = options.token
  }

  protected get endpoint() {
    return (() => {
      const { endpoint } = this.options

      return Promise.resolve(
        `${endpoint}?x-amz-customauthorizer-name=${AUTHORIZER_NAME}&token=${encodeURIComponent(this.token)}`
      )
    })()
  }
}
