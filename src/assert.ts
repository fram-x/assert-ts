enum FailureType {
  Condition = 'Condition',
  NoValue = 'NoValue',
}

enum Strictness {
  Strict = 'Strict',
  Soft = 'Soft',
}

type Formatter = (
  /**
   * Strict: assert(...) failed
   * Soft: assert.soft(...) failed
   */
  strictness: Strictness,
  failureType: FailureType,
  message?: string,
  props?: object,
) => string;

type ErrorCreator = (
  failureType: FailureType,
  message?: string,
  props?: object,
) => Error;

type ErrorReporter = (
  failureType: FailureType,
  error: Error,
  message?: string,
  props?: object,
) => void;

type WarningReporter = (
  failureType: FailureType,
  message?: string,
  props?: object,
) => void;

export type AssertConfiguration = {
  formatter?: Formatter;
  errorCreator?: ErrorCreator;
  errorReporter?: ErrorReporter;
  warningReporter?: WarningReporter;
};

type RequiredConfiguration = {
  formatter: Formatter;
  errorCreator: ErrorCreator;
  errorReporter?: ErrorReporter;
  warningReporter?: WarningReporter;
};

const messageFormatter: Formatter = (
  strictness: Strictness,
  failureType: FailureType,
  message?: string,
  props?: object,
): string => {
  const typeMap = {
    [Strictness.Strict]: {
      [FailureType.Condition]: 'Assert condition failed',
      [FailureType.NoValue]: 'Assert value not undefined/null failed',
    },
    [Strictness.Soft]: {
      [FailureType.Condition]: 'Check condition failed',
      [FailureType.NoValue]: 'Check value not undefined/null failed',
    },
  };

  const msg =
    typeMap[strictness][failureType] +
    (message ? `: ${message}` : '') +
    (props ? `: ${JSON.stringify(props)}` : '');

  return msg;
};

const errorCreatorFactory = (formatter: Formatter): ErrorCreator => {
  return (failureType: FailureType, message?: string, props?: object) =>
    new Error(formatter(Strictness.Strict, failureType, message, props));
};

const defaultConfiguration: RequiredConfiguration = {
  formatter: messageFormatter,
  errorCreator: errorCreatorFactory(messageFormatter),
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

interface HardAssert {
  /**
   * Verify that a condition is satisfied.
   * @param condition Condition to be true
   * @param message Error message
   * @param props Any props relevant.
   * @throws Throws exception if condition is false.
   */
  (
    condition: boolean,
    message?: string,
    props?: object | (() => object),
  ): asserts condition;

  /**
   * Verify that an optional value actually has a proper value in this context, i.e. not null or undefined.
   * @param value Value to be verified
   * @param message Error message
   * @param props If message is a string id, format any matching key values into message. Props are also reported to dev team.
   * @throws Throws exception if value is null or undefined
   */
  <T>(
    value: T | undefined | null,
    message?: string,
    props?: object | (() => object),
  ): T;
}

interface SoftAssert {
  /**
   * Test if a condition is satisfied. If false, a warning will be reported
   * @param condition Condition to be true
   * @param message Warning message
   * @param props Any props relevant.
   * @returns condition
   */
  (
    condition: boolean,
    message?: string,
    props?: object | (() => object),
  ): condition is true;

  /**
   * Test if an optional value actually is a proper value, i.e. not null or undefined. If value is not proper, a warning
   * will be reported
   * @param value Value to be tested
   * @param message Warning message
   * @param props If message is a string id, format any matching key values into message. Props are also reported to dev team.
   * @throws Throws exception if value is null or undefined
   */
  <T>(
    value: T | undefined | null,
    message?: string,
    props?: object | (() => object),
  ): value is T;
}

interface Assert extends HardAssert {
  soft: SoftAssert;
}

const hardAssert: HardAssert = <T>(
  conditionOrValue: T | boolean | undefined | null,
  message?: string,
  props?: object | (() => object),
): void | T => {
  if (typeof conditionOrValue === 'boolean') {
    if (!conditionOrValue) {
      const properties = typeof props === 'function' ? props() : props;
      const error = configuration.errorCreator(
        FailureType.Condition,
        message,
        properties,
      );

      if (configuration.errorReporter) {
        configuration.errorReporter(
          FailureType.Condition,
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
      FailureType.NoValue,
      message,
      properties,
    );

    if (configuration.errorReporter) {
      configuration.errorReporter(
        FailureType.NoValue,
        error,
        message,
        properties,
      );
    }

    throw error;
  }

  return conditionOrValue;
};

const softAssert: SoftAssert = <T>(
  conditionOrValue: T | boolean | undefined | null,
  message?: string,
  props?: object | (() => object),
): conditionOrValue is T | true => {
  if (typeof conditionOrValue === 'boolean') {
    if (!conditionOrValue) {
      const properties = typeof props === 'function' ? props() : props;

      if (configuration.warningReporter) {
        configuration.warningReporter(
          FailureType.Condition,
          message,
          properties,
        );
      } else {
        const formattedMessage = configuration.formatter(
          Strictness.Soft,
          FailureType.Condition,
          message,
          properties,
        );
        console.warn(formattedMessage);
      }
    }

    return conditionOrValue;
  }

  if (conditionOrValue === undefined || conditionOrValue === null) {
    const properties = typeof props === 'function' ? props() : props;

    if (configuration.warningReporter) {
      configuration.warningReporter(FailureType.NoValue, message, properties);
    } else {
      const formattedMessage = configuration.formatter(
        Strictness.Soft,
        FailureType.NoValue,
        message,
        properties,
      );
      console.warn(formattedMessage);
    }

    return false;
  }

  return true;
};

const _assert = hardAssert as Assert;
_assert.soft = softAssert;

export const assert = _assert;
