import {assert} from '../assert';

describe('default errorMessageFormatter', () => {
  it('assert false should give message with condition', () => {
    expect(() => assert(false)).toThrowError(/condition/);
  });
  it('assert undefiined should give message with undefined', () => {
    expect(() => assert(undefined)).toThrowError(/undefined/);
  });
  it('assert undefiined should give message with null', () => {
    expect(() => assert(null)).toThrowError(/null/);
  });
  it('assertion failure should give message with custom message', () => {
    expect(() => assert(null, 'Custom message')).toThrowError(/Custom message/);
  });
  it('assertion failure should give message with any props', () => {
    expect(() => assert(null, 'Custom message', {customValue: 5})).toThrowError(
      /customValue/,
    );
  });
  it('assertion failure should give message with any prop values', () => {
    expect(() => assert(null, 'Custom message', {customValue: 5})).toThrowError(
      /5/,
    );
  });
  it('assertion failure should give message with any props as function', () => {
    expect(() =>
      assert(null, 'Custom message', () => ({customValue: 5})),
    ).toThrowError(/customValue/);
  });
});
