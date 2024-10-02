# Th155 nut watcher

A CLI that makes modding squirrel .nut files for th155 easier by
automatically handling the compiling and rename-copying of files to the right
repo.

This is meant to be an _entry point_ tool for all th155 modders and
avoid spending time on boring routine tasks.

Very WIP, _technically_ supports Linux but needs wine right now.

## How to use
Run `nut-watcher.exe` in a terminal or cmd.exe window. The program will show the options when none are supplied.

The most common use-case is to work directly on a [th155 decomp](https://github.com/Dazegambler/th155-decomp/tree/v1.21b)
repo, in its `data` folder. From there, run nut-watcher with the `-o` option to your preferred thcrap repo's corresponding data folder.

Any changes to nut files you edit will be compiled, then copied to the repo. Changes should be hot-reloaded by thcrap but
depending on the file, you may need to reboot th155.

## How to get an executable
Grab the latest release
on the [releases page](https://github.com/Horoneru/th155-nut-watcher/releases). From there, pick the `.exe` if you're on Windows
or the file without an extension if on Linux. On Linux, you'll need wine for it to work properly for now.

You can also run `npm run build-windows` or `npm run build-linux` to get the executable you want
after getting the source code from this repo

## Planned TODO
- Config file for saving src/output directories
- Custom task for changed nut files
