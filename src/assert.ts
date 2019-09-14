enum AssertFailed {
  Condition = 'Condition',
  NoValue = 'NoValue',
}

type Formatter = (
  failureType: AssertFailed,
  message?: string,
  props?: object,
) => string;

type ErrorCreator = (
  failureType: AssertFailed,
  message?: string,
  props?: object,
) => Error;

type ErrorReporter = (
  failureType: AssertFailed,
  error: Error,
  message?: string,
  props?: object,
) => void;

export type AssertConfiguration = {
  formatter?: Formatter;
  errorCreator?: ErrorCreator;
  errorReporter?: ErrorReporter;
};

type RequiredConfiguration = {
  formatter: Formatter;
  errorCreator: ErrorCreator;
  errorReporter?: ErrorReporter;
};

const errorMessageFormatter: Formatter = (
  failureType: AssertFailed,
  message?: string,
  props?: object,
): string => {
  const msg =
    (failureType === AssertFailed.Condition
      ? 'Assert condition failed'
      : 'Assert value not undefined/null failed') +
    (message ? `: ${message}` : '') +
    (props ? `: ${JSON.stringify(props)}` : '');

  return msg;
};

const errorCreatorFactory = (formatter: Formatter): ErrorCreator => {
  return (failureType: AssertFailed, message?: string, props?: object) =>
    new Error(formatter(failureType, message, props));
};

const defaultConfiguration: RequiredConfiguration = {
  formatter: errorMessageFormatter,
  errorCreator: errorCreatorFactory(errorMessageFormatter),
};

let configuration = defaultConfiguration;

/**
 * Customize formatting of assertion failure messages, creation of failure Errors and reporting of failures
 * @param custom
 */
export function configureAssert(custom: AssertConfiguration) {
  const newConfig: RequiredConfiguration = {
    ...configuration,
    ...custom,
  };

  newConfig.errorCreator =
    custom.errorCreator || errorCreatorFactory(newConfig.formatter);

  configuration = newConfig;
}

/**
 * For test purpose
 */
export function testResetConfiguration() {
  configuration = defaultConfiguration;
}

/**
 * Verify that a condition is satisfied.
 * @param condition Condition to be true
 * @param message Error message
 * @param props Any props relevant.
 * @throws Throws exception if condition is false.
 */
export function assert(
  condition: boolean,
  message?: string,
  props?: object | (() => object),
): void;

/**
 * Verify that an optional value actually has a proper value in this context, i.e. not null or undefined.
 * @param value Value to be verified
 * @param message Error message
 * @param props If message is a string id, format any matching key values into message. Props are also reported to dev team.
 * @throws Throws exception if value is null or undefined
 */
export function assert<T>(
  value: T | undefined | null,
  message?: string,
  props?: object | (() => object),
): T;

export function assert<T>(
  conditionOrValue: T | boolean | undefined | null,
  message?: string,
  props?: object | (() => object),
): void | T {
  if (typeof conditionOrValue === 'boolean') {
    if (!conditionOrValue) {
      const properties = typeof props === 'function' ? props() : props;
      const error = configuration.errorCreator(
        AssertFailed.Condition,
        message,
        properties,
      );

      if (configuration.errorReporter) {
        configuration.errorReporter(
          AssertFailed.Condition,
          error,
          message,
          properties,
        );
      }

      throw error;
    }
    return;
  }

  if (typeof conditionOrValue === 'undefined' || conditionOrValue === null) {
    const properties = typeof props === 'function' ? props() : props;
    const error = configuration.errorCreator(
      AssertFailed.NoValue,
      message,
      properties,
    );

    if (configuration.errorReporter) {
      configuration.errorReporter(
        AssertFailed.NoValue,
        error,
        message,
        properties,
      );
    }

    throw error;
  }

  return conditionOrValue;
}
