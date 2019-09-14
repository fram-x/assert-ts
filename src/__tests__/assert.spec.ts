import {assert} from '../assert';

describe('assert', () => {
  it('assert true should not fail', () => {
    expect(() => assert(true)).not.toThrowError();
  });
  it('assert false should fail', () => {
    expect(() => assert(false)).toThrowError();
  });
});
