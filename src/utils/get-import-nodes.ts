import { ParserOptions, parse as babelParser } from '@babel/parser';
import traverse from '@babel/traverse';
import { ImportDeclaration } from '@babel/types';

import { attachSameLineComments } from './attach-same-line-comments.js';

export const getImportNodes = (code: string, options?: ParserOptions) => {
    const importNodes: ImportDeclaration[] = [];
    const ast = babelParser(code, {
        ...options,
        sourceType: 'module',
    });

    traverse(ast, {
        ImportDeclaration(path) {
            const tsModuleParent = path.findParent((p) =>
                p.isTSModuleDeclaration(),
            );
            if (!tsModuleParent) {
                importNodes.push(path.node);
            }
        },
    });

    attachSameLineComments(importNodes);
    importNodes.forEach((node) => attachSameLineComments(node.specifiers));

    return importNodes;
};
