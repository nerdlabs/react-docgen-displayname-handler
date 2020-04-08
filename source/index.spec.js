import test from 'ava';
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

test('Explicitly set displayName as member of React.createClass', (t) => {
  const doc = parse(
    `
    var MyComponent = React.createClass({ displayName: 'foo' });
  `,
    displayNameHandler
  );

  t.deepEqual(
    doc,
    { displayName: 'foo' },
    'should set the displayName property on documentation.'
  );
});

test('Explicitly set displayName as static class member', (t) => {
  const doc = parse(
    `
    class MyComponent extends React.Component { static displayName = 'foo'; render() {} }
  `,
    displayNameHandler
  );

  t.deepEqual(
    doc,
    { displayName: 'foo' },
    'should set the displayName property on documentation.'
  );
});

test('Infer displayName from function declaration/expression name', (t) => {
  {
    const doc = parse(
      `
      function MyComponent() { return <div />; }
    `,
      displayNameHandler
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should use function name as displayName'
    );
  }
  {
    const doc = parse(
      `
      var x = function MyComponent() { return <div />; }
    `,
      displayNameHandler
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should also take function name from function expressions'
    );
  }
});

test('Infer displayName from class declaration/expression name', (t) => {
  {
    const doc = parse(
      `
      class MyComponent extends React.Component { render() {} }
    `,
      displayNameHandler
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should use class name as displayName'
    );
  }
  {
    const doc = parse(
      `
      var x = class MyComponent extends React.Component { render() {} }
    `,
      displayNameHandler
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should also use class name from ClassExpression'
    );
  }
});

test('Infer displayName from variable declaration name', (t) => {
  const doc = parse(
    `
    var Foo = React.createClass({});
  `,
    displayNameHandler
  );

  t.deepEqual(
    doc,
    { displayName: 'Foo' },
    'should set the displayName property on documentation.'
  );
});

test('Infer displayName from assignment', (t) => {
  const doc = parse(
    `
    var Foo = {};
    Foo.Bar = () => <div />
  `,
    displayNameHandler
  );

  t.deepEqual(
    doc,
    { displayName: 'Foo.Bar' },
    'should set the displayName property on documentation.'
  );
});

test('Infer displayName from file name', (t) => {
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    createDisplayNameHandler('foo/bar/MyComponent.js')
  );

  t.deepEqual(
    doc,
    { displayName: 'MyComponent' },
    'should use the file name as displayName'
  );
});

test('Infer displayName from file path', (t) => {
  {
    const doc = parse(
      `
      module.exports = () => <div />;
    `,
      createDisplayNameHandler('foo/MyComponent/index.js')
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should use the file path as displayName'
    );
  }
  {
    const doc = parse(
      `
      module.exports = () => <div />;
    `,
      createDisplayNameHandler('foo/my-component/index.js')
    );

    t.deepEqual(
      doc,
      { displayName: 'MyComponent' },
      'should replace hyphens with uppercase characters'
    );
  }
});

test('Use default if displayName cannot be inferred', (t) => {
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    displayNameHandler
  );

  t.deepEqual(
    doc,
    { displayName: 'UnknownComponent' },
    'should use the default name'
  );
});
