/**
 * Helper methods for tests.
 */

import _recast from 'recast';
import babylon from 'react-docgen/dist/babylon';

function stringify(value: (string|string[])): string {
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return value;
}

/**
 * Returns a NodePath to the program node of the passed node
 */
export function parse(src: string, recast=_recast): NodePath {
  return new recast.types.NodePath(
    recast.parse(stringify(src), {esprima: babylon}).program
  );
}
