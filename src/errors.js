export class NotImplementedError extends Error {
  constructor(message) {
    super(message);

    this.message = message;
    this.name = 'NotImplementedError';
  }
}

export class HttpError extends Error {
  constructor(data_or_message, status, config) {
    super(data_or_message);

    if (typeof data_or_message == 'string') {
      this.message = data_or_message
    } else {
      if (config.messageCreator) {
        this.message = config.messageCreator(data_or_message)
      } else {
        this.message = data_or_message;
      }
    }
    this.status = status;
    this.name = 'HttpError';
  }
}
