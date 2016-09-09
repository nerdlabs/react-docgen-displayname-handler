import test from 'ava';
import recast from 'recast';
import Documentation from 'react-docgen/dist/Documentation';
import { resolver } from 'react-docgen';
import { parse } from '../tests/utils';
import displayNameHandler, { createDisplayNameHandler } from './index';
const { findAllComponentDefinitions } = resolver;

let documentation = null;

function findComponent(source) {
  const code = `var React = require('react');\n${source}`;
  return findAllComponentDefinitions(parse(code), recast)[0];
}

test.beforeEach(() => {
  documentation = new Documentation();
});

test('Explicitly set displayName as member of React.createClass', (t) => {
  const definition = findComponent(`
    var MyComponent = React.createClass({ displayName: 'foo' });
  `);
  displayNameHandler(documentation, definition);

  const actual = documentation.get('displayName');
  const expected = 'foo';

  t.is(actual, expected,
    'should set the displayName property on documentation.');
});

test('Explicitly set displayName as static class member', (t) => {
  const definition = findComponent(`
    class MyComponent { static displayName = 'foo'; render() {} }
  `);
  displayNameHandler(documentation, definition);

  const actual = documentation.get('displayName');
  const expected = 'foo';

  t.is(actual, expected,
    'should set the displayName property on documentation.');
});

test('Infer displayName from function declaration/expression name', (t) => {
  {
    const definition = findComponent(`
      function MyComponent() { return <div />; }
    `);
    displayNameHandler(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected, 'should use function name as displayName');
  }
  {
    const definition = findComponent(`
      var x = function MyComponent() { return <div />; }
    `);
    displayNameHandler(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected,
      'should also take function name from function expressions');
  }
});

test('Infer displayName from class declaration/expression name', (t) => {
  {
    const definition = findComponent(`
      class MyComponent { render() {} }
    `);
    displayNameHandler(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected, 'should use class name as displayName');
  }
  {
    const definition = findComponent(`
      var x = class MyComponent { render() {} }
    `);
    displayNameHandler(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected, 'should also use class name from ClassExpression');
  }
});

test('Infer displayName from variable declaration name', (t) => {
  const definition = findComponent(`
    var Foo = React.createClass({});
  `);
  displayNameHandler(documentation, definition);

  const actual = documentation.get('displayName');
  const expected = 'Foo';

  t.is(actual, expected,
    'should set the displayName property on documentation.');
});

test('Infer displayName from file name', (t) => {
  const definition = findComponent(`
    module.exports = () => <div />;
  `);
  createDisplayNameHandler('foo/bar/MyComponent.js')(documentation, definition);

  const actual = documentation.get('displayName');
  const expected = 'MyComponent';

  t.is(actual, expected, 'should use the file name as displayName');
});

test('Infer displayName from file path', (t) => {
  {
    const definition = findComponent(`
      module.exports = () => <div />;
    `);
    createDisplayNameHandler('foo/MyComponent/index.js')(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected, 'should use the file path as displayName');
  }
  {
    const definition = findComponent(`
      module.exports = () => <div />;
    `);
    createDisplayNameHandler('foo/my-component/index.js')(documentation, definition);

    const actual = documentation.get('displayName');
    const expected = 'MyComponent';

    t.is(actual, expected, 'should replace hyphens with uppercase characters');
  }
});

test('Use default if displayName cannot be inferred', (t) => {
  const definition = findComponent(`
    module.exports = () => <div />;
  `);
  displayNameHandler(documentation, definition);

  const actual = documentation.get('displayName');
  const expected = 'UnknownComponent';

  t.is(actual, expected, 'should use the default name');
});
