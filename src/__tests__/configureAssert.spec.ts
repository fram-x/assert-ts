import {assert, configureAssert, testResetConfiguration} from '../assert';

describe('configureAssert', () => {
  it('custom formatter should be used for error message', () => {
    configureAssert({
      formatter: () => 'Custom message',
    });
    expect(() => assert(false)).toThrowError(/Custom message/);
    testResetConfiguration();
  });
  it('custom error creator should be used', () => {
    configureAssert({
      errorCreator: () => new Error('Custom error creator'),
    });
    expect(() => assert(false)).toThrowError(/Custom error creator/);
    testResetConfiguration();
  });
  it('custom error reporter should be invoked', () => {
    let reported:
      | {
          type?: string;
          error?: Error;
          message?: string;
          props?: object;
        }
      | undefined;

    configureAssert({
      errorReporter: (type, error, message, props) => {
        reported = {
          type,
          error,
          message,
          props,
        };
      },
    });
    expect(() =>
      assert(false, 'Custom message', {customProp: 5}),
    ).toThrowError();
    reported = assert(reported);
    expect(reported.type).toEqual('Condition');
    expect(assert(reported.error).message).toContain('Custom message');
    expect(reported.message).toEqual('Custom message');
    expect(reported.props).toEqual({customProp: 5});
    testResetConfiguration();
  });
});
