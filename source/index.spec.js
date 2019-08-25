import assert from 'assert';
import * as docgen from 'react-docgen';
import displayNameHandler, { createDisplayNameHandler } from './index';

const {
  resolver: { findAllComponentDefinitions },
} = docgen;

function parse(source, handler) {
  const code = `
    var React = require('react');
    ${source}
  `;
  return docgen.parse(code, findAllComponentDefinitions, [handler])[0];
}

// Explicitly set displayName as member of React.createClass
{
  const doc = parse(
    `
    var MyComponent = React.createClass({ displayName: 'foo' });
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'foo' },
    'should set the displayName property on documentation.'
  );
}

// Explicitly set displayName as static class member
{
  const doc = parse(
    `
    class MyComponent extends React.Component { static displayName = 'foo'; render() {} }
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'foo' },
    'should set the displayName property on documentation.'
  );
}

// Infer displayName from function declaration name
{
  const doc = parse(
    `
      function MyComponent() { return <div />; }
    `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should use function name as displayName'
  );
}

// Infer displayName from function expression name
{
  const doc = parse(
    `
      var x = function MyComponent() { return <div />; }
    `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should also take function name from function expressions'
  );
}

// Infer displayName from class declaration name
{
  const doc = parse(
    `
    class MyComponent extends React.Component{ render() {} }
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should use class name as displayName'
  );
}

// Infer displayName from class expression name
{
  const doc = parse(
    `
    var x = class MyComponent extends React.Component{ render() {} }
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should also use class name from ClassExpression'
  );
}

// Infer displayName from variable declaration name
{
  const doc = parse(
    `
    var Foo = React.createClass({});
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'Foo' },
    'should set the displayName property on documentation.'
  );
}

// Infer displayName from assignment
{
  const doc = parse(
    `
    var Foo = {};
    Foo.Bar = () => <div />
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'Foo.Bar' },
    'should set the displayName property on documentation.'
  );
}

// Infer displayName from file name
{
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    createDisplayNameHandler('foo/bar/MyComponent.js')
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should use the file name as displayName'
  );
}

// Infer displayName from file path (capitalized)
{
  const doc = parse(
    `
      module.exports = () => <div />;
    `,
    createDisplayNameHandler('foo/MyComponent/index.js')
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should use the file path as displayName'
  );
}
// Infer displayName from file path (kebab-case)
{
  const doc = parse(
    `
      module.exports = () => <div />;
    `,
    createDisplayNameHandler('foo/my-component/index.js')
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'MyComponent' },
    'should replace hyphens with uppercase characters'
  );
}

// Use default if displayName cannot be inferred
{
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    displayNameHandler
  );

  assert.deepStrictEqual(
    doc,
    { displayName: 'UnknownComponent' },
    'should use the default name'
  );
}
