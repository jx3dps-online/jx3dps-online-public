## 剑网 3 配装计算器

剑网 3 配装计算器，包含配装器、属性录入、伤害计算、循环模拟、攻略和 JCL 战斗记录解析。

### 开发

```powershell
# 安装依赖
corepack pnpm@10.34.5 install --frozen-lockfile

# 启动开发服务
corepack pnpm@10.34.5 run dev

# 访问页面
http://localhost:3000/
```

### 构建

```powershell
corepack pnpm@10.34.5 run build
```

构建产物在 `build/`。`public/jcl-wasm/` 内是已提交的 JCL WASM 运行时资源，普通开发和构建直接复用。

### 目录

- `src/`：前端源码
- `public/`：静态资源与 JCL WASM 产物
- `config/`：webpack 与开发服务配置
- `scripts/`：开发、构建入口

### 说明

- 纯前端项目，用户数据保存在浏览器 localStorage。
- JCL 战斗记录解析在 Web Worker 中通过 Pyodide 本地执行。
- 数据文件、计算逻辑和页面配置均在 `src/` 下维护。

### License

见 [LICENSE](LICENSE)。
