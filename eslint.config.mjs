import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['**/node_modules', '**/dist', '*/*/types', '.gitignore', '.npmrc', '.DS_Store']
  },
  // {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  /** js推荐配置 */
  pluginJs.configs.recommended,
  /** ts推荐配置 */
  ...tseslint.configs.recommended,
  /** vue推荐配置 */
  ...pluginVue.configs['flat/essential'],
  /** prettier 配置 */
  eslintPluginPrettierRecommended,

  /** javascript 规则 */
  {
    files: ['**/*.{js,mjs,cjs,ts,vue,jsx,tsx}'],
    rules: {
      // 对象结尾逗号
      'comma-dangle': 'off',
      // 关闭未定义变量
      'no-undef': 'off',
      // 确保 Prettier 的行为不会被 ESLint 覆盖
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      // 关闭对未定义变量的警告
      'no-undefined': 'off',
      //不使用的变量不报错
      'no-unused-vars': 'off',
      // 禁止使用不规范的空格
      'no-irregular-whitespace': 'off',
      // 函数括号前的空格
      'space-before-function-paren': 0,
      // 箭头函数的空格
      'arrow-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],
      // 代码块的空格
      'block-spacing': [2, 'always'],
      // 大括号风格
      'brace-style': [
        2,
        '1tbs',
        {
          allowSingleLine: true
        }
      ],
      // 对象属性换行
      'object-property-newline': 'off',
      // JSX 引号风格 <'prefer-double', 'prefer-single'>
      'jsx-quotes': [2, 'prefer-double'],
      // 对象键值对之间的空格
      'key-spacing': [
        2,
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      // 关键字之间的空格
      'keyword-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],
      // 构造函数首字母大写
      'new-cap': [
        2,
        {
          newIsCap: true,
          capIsNew: false
        }
      ],
      // new 操作符使用时需要括号
      'new-parens': 2,
      // 禁止使用 Array 构造函数
      'no-array-constructor': 2,
      // 禁止调用 caller 和 callee
      'no-caller': 2,
      // 禁止重新分配类名
      'no-class-assign': 2,
      // 禁止条件中的赋值操作
      'no-cond-assign': 2,
      // 禁止 const 重新分配
      'no-const-assign': 2,
      // 正则表达式中的控制字符
      'no-control-regex': 0,
      // 禁止删除变量
      'no-delete-var': 2,
      // 禁止在函数参数中使用重复名称
      'no-dupe-args': 2,
      // 禁止在类中使用重复名称的成员
      'no-dupe-class-members': 2,
      // 禁止在对象字面量中使用重复的键
      'no-dupe-keys': 2,
      // 禁止重复的 case 标签
      'no-duplicate-case': 2,
      // 禁止空的字符类
      'no-empty-character-class': 2,
      // 禁止空的解构模式
      'no-empty-pattern': 2,
      // 禁止使用 eval
      'no-eval': 2,
      // 不允许出现空的代码块
      'no-empty': 2,
      // 禁止不必要的布尔转换
      'no-extra-boolean-cast': 2,
      // 禁止不必要的括号
      'no-extra-parens': [2, 'functions'],
      // 禁止 case 语句落空
      'no-fallthrough': 2,
      // 禁止在数字后面添加小数点
      'no-floating-decimal': 2,
      // 禁止对函数声明重新赋值
      'no-func-assign': 2,
      // 禁止出现歧义多行表达式
      'no-unexpected-multiline': 2,
      // 禁止不需要的转义
      'no-useless-escape': 0,
      // 数组的括号前后的间距
      'array-bracket-spacing': [2, 'never']
    }
  },
  /** vue 规则 */
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        /** typescript项目需要用到这个 */
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        /** 允许在.vue 文件中使用 JSX */
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'vue/component-definition-name-casing': 'off',
      'vue/singleline-html-element-content-newline': ['off'],
      'vue/no-mutating-props': [
        'error',
        {
          shallowOnly: true
        }
      ],
      // 要求组件名称始终为 “-” 链接的单词
      'vue/multi-word-component-names': 'off',
      // 关闭 index.html 文件报 clear 错误
      'vue/comment-directive': 'off',
      // 关闭对 defineProps 的有效性检查
      'vue/valid-define-props': 'off',
      // 允许在一个文件中定义多个组件
      'vue/one-component-per-file': 'off',
      // 关闭 Prop 类型要求的警告
      'vue/require-prop-types': 'off',
      // 关闭属性顺序要求
      'vue/attributes-order': 'off',
      // 关闭对默认 Prop 的要求
      'vue/require-default-prop': 'off',
      // 关闭连字符命名检验
      'vue/attribute-hyphenation': 'off',
      // 关闭自闭合标签的要求
      'vue/html-self-closing': 'off',
      // 禁止在关闭的括号前有换行
      'vue/html-closing-bracket-newline': 'off',
      // 允许使用 v-html 指令
      'vue/no-v-html': 'off'
    }
  },

  {
    /**
     * "off" 或 0    ==>  关闭规则
     * "warn" 或 1   ==>  打开的规则作为警告（不影响代码执行）
     * "error" 或 2  ==>  规则作为一个错误（代码不能执行，界面报错）
     */
    rules: {
      // eslint (http://eslint.cn/docs/rules)
      // 'no-var': 'error', // 要求使用 let 或 const 而不是 var
      // 'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
      // 'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
      // 'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们

      // typeScript (https://typescript-eslint.io/rules)
      // '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
      // '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
      // '@typescript-eslint/ban-ts-comment': 'error', // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
      // '@typescript-eslint/no-inferrable-types': 'off', // 可以轻松推断的显式类型可能会增加不必要的冗长
      // '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间
      '@typescript-eslint/no-explicit-any': 'off' // 禁止使用 any 类型
      // '@typescript-eslint/ban-types': 'off', // 禁止使用特定类型
      // '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 函数导入模块
      // '@typescript-eslint/no-empty-function': 'off', // 禁止空函数
      // '@typescript-eslint/no-non-null-assertion': 'off', // 不允许使用后缀运算符的非空断言(!)

      // vue (https://eslint.vuejs.org/rules)
      // 'vue/script-setup-uses-vars': 'error', // 防止<script setup>使用的变量<template>被标记为未使用，此规则仅在启用该no-unused-vars规则时有效
      // 'vue/v-slot-style': 'error', // 强制执行 v-slot 指令样式
      // 'vue/no-mutating-props': 'error', // 不允许改变组件 prop
      // 'vue/custom-event-name-casing': 'error', // 为自定义事件名称强制使用特定大小写
      // 'vue/html-closing-bracket-newline': 'error', // 在标签的右括号之前要求或禁止换行
      // 'vue/attribute-hyphenation': 'error', // 对模板中的自定义组件强制执行属性命名样式：my-prop="prop"
      // 'vue/attributes-order': 'off', // vue api使用顺序，强制执行属性顺序
      // 'vue/no-v-html': 'off', // 禁止使用 v-html
      // 'vue/require-default-prop': 'off', // 此规则要求为每个 prop 为必填时，必须提供默认值
      // 'vue/multi-word-component-names': 'off' // 要求组件名称始终为 “-” 链接的单词
      // 'vue/no-setup-props-destructure': 'off' // 禁止解构 props 传递给 setup
    }
  }
];
