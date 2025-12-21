# Surround it! — v0.6.0

![Release](https://img.shields.io/github/v/release/Andret2344/surround-it)
![GitHub Release Date](https://img.shields.io/github/release-date/Andret2344/surround-it)
[![License](https://img.shields.io/github/license/Andret2344/surround-it?color=blue)](https://github.com/Andret2344/surround-it/blob/main/LICENSE.txt)
![Pipeline](https://img.shields.io/github/actions/workflow/status/Andret2344/surround-it/ci.yml)
![Issues opened](https://img.shields.io/github/issues-raw/Andret2344/surround-it)
![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FAndret2344%2Fsurround-it&label=repository%20visits&countColor=%230c7ebe&style=flat)
![Chrome Extension Users](https://img.shields.io/chrome-web-store/users/cjelblbjilfobifendknkljagdndaipd)

---

**Simple. Fast. Intuitive.**

Wrap selected text in quotes, backticks, or brackets — just like your favorite IDE, but right in your browser.

---

## Table of Contents

- [Surround it! — v0.6.0](#surround-it--v060)
    * [Table of Contents](#table-of-contents)
    * [Overview](#overview)
    * [Features](#features)
    * [Installation](#installation)
    * [Usage](#usage)
    * [Configuration & Options](#configuration--options)
    * [Development](#development)
        + [Prerequisites](#prerequisites)
        + [Setup Instructions](#setup-instructions)
        + [Running the code](#running-the-code)
            - [Build](#build)
            - [Test](#test)
    * [Contribution Guidelines](#contribution-guidelines)
    * [License & Acknowledgments](#license--acknowledgments)
    * [Contact](#contact)

---

## Overview

**Surround it!** is a browser extension (Chrome, Firefox, Edge) that replicates one of the most addictive features in modern IDEs: wrapping a selected text with matching quotes,
backticks, or brackets. Automagically and intelligently.

- **Inspired by**: IDEs like VS Code, IntelliJ — makes typing quotes or brackets wrap selected content instead of replacing it.
- **Use case**: Developers, writers, editors — anyone editing text and tired of manually wrapping selections.

---

## Features

- Wrap selected text with:
    - `" "` (double quotes)
    - `' '` (single quotes)
    - `` ` ` `` (backticks)
    - `( )` (parentheses)
    - `[ ]` (square brackets)
    - `{ }` (curly braces)
- **Extensible**: You can customize the wrapping characters due to your liking.
- **Lightweight** and **minimal permissions**.
- **Configurable**: Enable or disable all inserting or wrapping behavior.

---

## Installation

| Browser | Link                                                                                                       |
|---------|------------------------------------------------------------------------------------------------------------|
| Chrome  | [Download](https://chrome.google.com/webstore/detail/cjelblbjilfobifendknkljagdndaipd)                     |
| Firefox | [Download](https://addons.mozilla.org/en-US/firefox/addon/surround-it/)                                    |
| Edge    | [Download](https://microsoftedge.microsoft.com/addons/detail/surround-it/klkpiglljjcogfoinnimkkkhmjmjmonk) |

---

## Usage

1. Install the extension from your browser's store (see [Installation](#installation)).
2. Highlight any text in an input, textarea, or contentEditable DOM element.
3. Press the key for the desired wrapper (e.g., `"`).
4. **Result**: Text is automatically wrapped: `"selected text"`
5. **Edge cases**:
    - **No selection**: Insert an empty pair and place the cursor between.
    - **Text already wrapped**: Wrap again.

---

## Configuration & Options

- Adding custom wrappers in the menu.
- Enabling or disabling every configured wrapper.
- Enable or disable the wrapping behavior.
- Enable or disable all inserting or wrapping behavior.

---

## Development

### Prerequisites

Tested versions:

- Node.js **>= 22.18.0**
- Yarn **>= 1.22.22**

> [!NOTE]
> Other versions might work as well but haven't been tested. If you have knowledge about it running on earlier versions, please let me know.

### Setup Instructions

```bash
git clone git@github.com:Andret2344/surround-it.git
cd surround-it
yarn
````

### Running the code

#### Build

There are four tasks to work with the extension locally:

- `yarn build:chromium` - build the extension for chromium-based browsers.
- `yarn watch:chromium` - as above, but in a constant-watching mode.
- `yarn build:firefox` - build the extension for firefox browser.
- `yarn watch:firefox` - as above, but in a constant-watching mode.

#### Test

After running the `:build` or `:watch` task, load the `dist/` folder:

* **Chrome/Edge**: Via `chrome://extensions`.
* **Firefox**: Via `about:addons` on [Firefox developer edition](https://www.firefox.com/en-US/channel/desktop/developer/).

> [!IMPORTANT]
> There are currently no automatic tests, will be added in the future.

---

## Contribution Guidelines

Contributions welcome:

1. Fork the repo.
2. Create your feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Descriptive message"`.
4. Push: `git push origin feature-name`.
5. Open a pull request.

Please follow:

* Clear commit messages
* Consistent formatting (indentation, quotes, etc.)
* Explain your changes in the PR description

---

## License & Acknowledgments

* © 2025 **Andret2344**
* License: **CC BY-SA 4.0**
* Inspired by behavior in popular IDEs like IntelliJ IDEA.

---

## Contact

Questions, ideas, bug reports:

* GitHub Issues: https://github.com/Andret2344/surround-it/issues
* Email: [andret2344@gmail.com](mailto:andret2344@gmail.com)
