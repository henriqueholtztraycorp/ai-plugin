# Wake Commerce CLI

CLI for Wake Commerce.

## Installation

```bash
npm install
npm run build
```

For global install:

```bash
npm link
```

## Usage

```bash
# Show help
wake-commerce --help
# or short alias
wc --help

# Initialize project
wake-commerce init

# Manage configuration
wake-commerce config get <key>
wake-commerce config set <key> <value>

# Check status
wake-commerce status
```

## Development

```bash
npm run dev -- --help    # Run without building
npm run build            # Compile TypeScript
npm start -- --help      # Run compiled CLI
```

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize Wake Commerce in the current project |
| `config` | Manage configuration (get/set) |
| `status` | Show project status |
