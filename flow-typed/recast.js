/**
 * A minimal set of declarations to make flow work with the recast API.
 */

type ASTNode = Object;

type VisitorMap = { [name: string]: (path: NodePath) => boolean };

declare class Scope {
  lookup(name: string): ?Scope;
  lookupType(name: string): ?Scope;
  getBindings(): {[key: string]: Array<NodePath>};
  getTypes(): {[key: string]: Array<NodePath>};
  getGlobalScope(): Scope;
  node: NodePath;
}

declare class NodePath {
  value: (ASTNode|Array<ASTNode>);
  node: ASTNode;
  parent: NodePath;
  parentPath: NodePath;
  scope: Scope;

  get(...x: Array<string|number>): NodePath;
  each(f: (p: NodePath) => any): any;
  map<T>(f: (p: NodePath) => T): Array<T>;
  filter(f: (p: NodePath) => bool): Array<NodePath>;
  push(node: ASTNode): void;
}

declare module 'recast' {
  declare function parse(src: string): ASTNode;
  declare function print(path: NodePath): { code: string };
  declare function visit(node: ASTNode, methods: VisitorMap): void;
  declare var types: Object;
}
