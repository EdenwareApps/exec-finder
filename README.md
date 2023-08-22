# ExecFinder

`ExecFinder` is a Node.js module that helps you find executable files (executables) on different platforms such as Windows, macOS, and Linux. It provides a way to scan through common directories where executables are often installed, making it easier to locate specific executable files.

## Installation

You can install the `ExecFinder` module using npm:

```sh
npm install exec-finder
```

## Usage

```
const ExecFinder = require('exec-finder');

const finder = new ExecFinder();

// Find executables by name and return an array of file paths
finder.find('vlc')
  .then(files => {
    console.log('Found VLC executables:');
    console.log(files);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## API

### `new ExecFinder([options])`

Creates a new instance of `ExecFinder`. You can provide optional configuration options:

- `options.recursion`: The maximum recursion level when scanning subdirectories (default: 2).

### `finder.scanDirs([refresh])`

Scans the common directories for executables. Returns a promise that resolves to an array of file paths.

- `refresh` (optional): Set to `true` to force a refresh of the executable list.

### `finder.find(names, [options])`

Finds executables by name. Returns a promise that resolves to an object containing arrays of file paths for each name.

- `names`: A string or an array of strings representing executable names.
- `options.refresh` (optional): Set to `true` to force a refresh of the executable list.
- `options.first` (optional): Set to `true` to return only the first found executable path.

### `finder.findOne(names)`

Finds the first occurrence of an executable by name. Returns a promise that resolves to the first found executable path.

## Platform Support

- Windows: Supports scanning in common Program Files directories and User AppData directories.
- macOS: Supports scanning in common Application directories, `/usr/bin`, `/usr/local/bin`, `/opt`, and user's `bin` directory.
- Linux: Supports scanning in `/usr/bin`, `/usr/local/bin`, and `/opt`.

## License

This module is released under the [MIT License](https://opensource.org/licenses/MIT).

