# Node Build and Test

This skill installs dependencies, builds, and tests a Node.js project.

## Usage

Invoke this skill in a Node.js project directory:

```
/skill node-build-test
```

The skill will run the following steps in order:
1. `npm install` (or `yarn install` if a yarn.lock is present)
2. `npm run build` (or the project's build command)
3. `npm test` (or the project's test command)

## Customization

You can customize the commands by editing this skill file. Replace the command in each step with your project's specific commands.

## Steps

### Install
```bash
# Use Yarn if yarn.lock exists, otherwise use npm
if [ -f yarn.lock ]; then
  echo "Installing dependencies with Yarn..."
  yarn install
else
  echo "Installing dependencies with npm..."
  npm install
fi
```

### Build
```bash
echo "Building the project..."
# Check if a build script is defined in package.json
if grep -q '"build"' package.json; then
  npm run build
else
  echo "No build script found in package.json. Skipping build step."
fi
```

### Test
```bash
echo "Running tests..."
# Check if a test script is defined in package.json
if grep -q '"test"' package.json; then
  npm test
else
  echo "No test script found in package.json. Skipping test step."
fi
```