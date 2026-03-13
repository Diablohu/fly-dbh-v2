# fly-dbh.com V2

基于 _Astro_ 框架，UI 组件使用 _React_ 开发，打包输出结果为 _Node.js_ 服务器。

- _Astro_ 框架允许混用 _React_、_Vue_、_Svelte_ 等 UI 框架，目前仅使用 _React_，当然还有 _Astro_ 自带格式的组件（`.astro` 模板文件）。
- 由于本项使用 CMS，内容是动态的，考虑到 SEO，所以需要 SSR，故打包输出结果设置为 _Node.js_ 服务器。

---

## 开始开发

1. 在项目根目录创建 `.env` 文件，内容为：

```dotenv
SANITY_PROJECT_ID=[Sanity 项目 ID]
SANITY_DATASET=[Sanity 数据集名称]
ADMIN_TOTP_KEY=[登录管理页面所用一次性密码的生成密钥]
```

<details>
<summary>关于 Sanity</summary>

[fly-dbh.com](https://fly-dbh.com) 使用 _Sanity_ 作为 CMS。

_Sanity_ 是一个开源的 CMS 项目，包含数据库逻辑和前端管理页面，同时，_Sanity_ 项目背后的其运营方，也为小型项目提供免费的内容托管服务。
上述所需的 `PROJECT_ID` 和 `DATASET` 就是 _Sanity_ 托管服务的项目标识。

运行该代码库需要这些标识信息，而我自然不会公开 [fly-dbh.com](https://fly-dbh.com) 所用的 _Sanity_ 项目 ID。
关于 [fly-dbh.com](https://fly-dbh.com) 所用的 _Sanity_ 项目结构，是开源公开的，可见 [这一代码库](https://github.com/Diablohu/fly-dbh-cms-sanity)。

各位如果想在本地运行该项目，可以使用上述 _Sanity_ 结构开设一个 _Sanity_ 项目，并使用开设的项目的 ID。

</details>

2. 运行命令

```bash
# 安装 NPM 依赖包
> npm install
# 选择命令
> npm start
```

<details>
<summary>关于上线流程</summary>

可直接通过 `npm start` 命令触发上线流程。

线上版本使用 _Docker_ 镜像部署发布，打包流程是在 _Docker_ 容器内完成的。

- 代码库根目录下的各 `Dockerfile` 文件为对应的 _Docker_ 镜像生成文件，供各环境使用。
    - 不带后缀的文件，对应生产环境使用。
- 如果要更改生产环境发布流程，只需修改对应的 `Dockerfile`。

</details>

---

## 开发注意事项

### 页面 & 特殊目录 `@/pages`

<details>
<summary>展开</summary>

该目录下的 `.astro` 文件，会自动地根据目录结构，生成网站路由结构，如：

- `@/pages/index.astro` 对应首页 `/`
- `@/pages/sale.astro` 对应二级页面 `/sale`
- `@/pages/support/index.astro` 对应二级页面 `/support`

所有的页面，以及暴露的接口请求（_Astro_ 称其为 `endpoint`）均放在 `@/pages` 目录下。

**除非** 该目录或文件的名称称以 `_` 为开头，这些目录和文件不会生成路由结构。

因此，如果需要在 `@/pages/` 下存放模板或者素材，请以 `_` 为开头命名，如：

- `@/pages/home/_components/footer.tsx`
- `@/pages/videos/_assets/youtube.svg`

另外，`@/pages` 下的第一级目录，如果名称和语言 ID 相同，则会被视为该语种的特殊模板目录。

- 当前所有语言会使用相同的模板文件，如访问日文版 `/ja/cases` 时，也会使用 `@/pages/cases/index.astro` 作为模板文件。
- 如果存在 `@/pages/ja/cases/index.astro` 文件，访问这一 URL 时则会使用该文件作为模板文件，以此可以完全区分不同语言的渲染结果。

有关 _Astro_ 的页面和路由的详细规则，请见[官方开发文档](https://docs.astro.build/en/basics/astro-pages/)。

</details>

### _State_ 共享

<details>
<summary>展开</summary>

在 _Astro_ 框架下，_React_ 组件之间没有联系，是不属于同一个根组件的，故使用 _Context_ 之类的方案共享 _State_ 这样的方式行不通。

根据 _Astro_ 官方的建议，如果有这样的需求，可采用 `nanostores` 来开发。可查阅 [参考文档](https://docs.astro.build/en/recipes/sharing-state-islands/)。

本代码库已安装有 `nanostores`。

</details>
