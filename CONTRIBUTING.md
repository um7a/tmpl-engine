# Contributing Guide

This guide explains how to set up your environment, build, test, and publish the package.

## 🧩 Project Setup

1. **Fork and clone** the repository:
  ```shell
  git clone https://github.com/um7a/tmpl-engine.git
  cd tmpl-engine
  ```

2. Install dependencies:
  ```shell
  npm install
  ```

3. Verify installation:
  ```shell
  npm run build
  npm test
  ```

## 🏗️ Build

To compile the source code:

```shell
npm run build
```

Make sure there are no TypeScript or linting errors before submitting a PR.

## 🧪 Testing

Run the test suite before committing:

```shell
npm test
```

## 🚀 Publishing (Maintainers Only)

Only project maintainers should publish new versions to npm.

1. Bump the version:
  ```shell
  npm version patch
  ```
  (Use `minor` or `major` depending on changes)

2. Build and test before publishing:
  ```shell
  npm run build
  npm test
  ```

3. Publish to npm:
  ```shell
  npm publish --access public
  ```

4. Push tags and commits:
  ```shell
  git push origin main --follow-tags
  ```

## 💬 Questions or Issues?

If you encounter a problem:

1. Check (open issues)[https://github.com/um7a/tmpl-engine/issues]
2. If it’s new, (open an issue)[https://github.com/um7a/tmpl-engine/issues/new]

