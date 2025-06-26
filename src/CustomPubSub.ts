import { PubSub, PubSubOptions } from '@aws-amplify/pubsub'

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
        `${endpoint}?x-amz-customauthorizer-name=SuvieCheckoutTokenAuthorizer&token=${encodeURIComponent(this.token)}`
      )
    })()
  }
}
