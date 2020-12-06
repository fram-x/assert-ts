import {assert, configureAssert} from '../assert';

let logHistory: string[] = [];
const log = (msg: string) => logHistory.push(msg);

describe('assert', () => {
  beforeAll(() => {
    configureAssert({
      errorReporter: (failureType, error, message, props) => {
        log(`ERROR: ${failureType}, ${error}, ${message}: ${props}`);
      },
      warningReporter: (failureType, message, props) => {
        log(`WARNING: ${failureType}, ${message}: ${props}`);
      },
    });
  });

  describe('hard (default)', () => {
    it('assert true should not fail', () => {
      expect(() => assert(true)).not.toThrowError();
    });
    it('assert false should fail', () => {
      expect(() => assert(false)).toThrowError();
    });
    it('assert undefiined should fail', () => {
      expect(() => assert(undefined)).toThrowError();
    });
    it('assert null should fail', () => {
      expect(() => assert(null)).toThrowError();
    });
    it('assert an empty string should not fail', () => {
      expect(() => assert('')).not.toThrowError();
    });
    it('assert a non-empty string should not fail', () => {
      expect(() => assert('string')).not.toThrowError();
    });
    it('assert an empty array should not fail', () => {
      expect(() => assert([])).not.toThrowError();
    });
    it('assert a non-empty array should not fail', () => {
      expect(() => assert([5])).not.toThrowError();
    });
    it('assert an empty object should not fail', () => {
      expect(() => assert({})).not.toThrowError();
    });
    it('assert a non-empty object should not fail', () => {
      expect(() => assert({n: 5})).not.toThrowError();
    });
    it('assert 0 should not fail', () => {
      expect(() => assert(0)).not.toThrowError();
    });
    it('assert 1 should not fail', () => {
      expect(() => assert(1)).not.toThrowError();
    });
  });

  describe('soft', () => {
    beforeEach(() => {
      logHistory = [];
    });
    it('assert.soft true should return true', () => {
      const val = true;
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft true should not log', () => {
      const val = true;
      assert.soft(val);
      expect(logHistory.length).toBe(0);
    });
    it('assert.soft false should return false', () => {
      const val = false;
      if (assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft false should log warning', () => {
      const val = false;
      assert.soft(val);
      expect(logHistory[0]).toContain('WARNING');
    });
    it('assert.soft undefiined should return false', () => {
      const val = undefined;
      if (assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft null should return false', () => {
      const val = null;
      if (assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft an empty string should return true', () => {
      const val = '';
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft a non-empty string should return true', () => {
      const val = 'test';
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft an empty array should return true', () => {
      const val: any[] = [];
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft a non-empty array should return true', () => {
      const val = [5];
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft an empty object should not fail', () => {
      const val = {};
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft a non-empty object should not fail', () => {
      const val = {a: 'b'};
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft 0 should not fail', () => {
      const val = 0;
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft 1 should not fail', () => {
      const val = 1;
      if (!assert.soft(val)) {
        fail();
      }
    });
    it('assert.soft T? should constrain type to T when proper value', () => {
      type P = {
        name: string;
      };
      const ps: (P | undefined)[] = [{name: 'n'}, undefined];

      ps.forEach((p?: P) => {
        if (assert.soft(p)) {
          expect(p.name).toBe('n');
        } else {
          expect(p).toBe(undefined);
        }
      });
    });
  });
});
