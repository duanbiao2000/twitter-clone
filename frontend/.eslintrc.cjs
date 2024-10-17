// 导出ESLint配置
module.exports = {
	// 根目录
	root: true,
	// 环境配置
	env: { browser: true, es2020: true },
	// 继承的规则
	extends: [
		"eslint:recommended", // 使用ESLint推荐的规则
		"plugin:react/recommended", // 使用React插件推荐的规则
		"plugin:react/jsx-runtime", // 使用React的JSX运行时
		"plugin:react-hooks/recommended", // 使用React Hooks推荐的规则
	],
	// 忽略的文件
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	// 解析器选项
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	// 设置
	settings: { react: { version: "18.2" } },
	// 插件
	plugins: ["react-refresh"],
	// 规则
	rules: {
		// 禁用jsx-no-target-blank规则
		"react/jsx-no-target-blank": "off",
		// 启用react-refresh/only-export-components规则，允许常量导出
		"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		// 禁用react/prop-types规则
		"react/prop-types": "off",
	},
};