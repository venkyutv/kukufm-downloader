# KukuFM Downloader (Personal Use Only)

A command-line tool to download audio content from KukuFM for personal offline access. Supports batch downloads, custom cookies, and flexible configuration. Built with TypeScript for reliability and easy customization.

## Features
- Download audio content from KukuFM
- Batch download support
- Custom cookies for authentication
- Flexible and easy configuration
- Written in TypeScript

## Installation

Make sure you have [pnpm](https://pnpm.io/) installed:

```sh
npm install -g pnpm
```

Install dependencies:

```sh
pnpm install
```

## Usage

To run the downloader:

```sh
pnpm start
```

Or, if you have a development script:

```sh
pnpm run dev
```

## Configuration

1. **Authentication:**  
   Place your KukuFM authentication cookies in `src/cookies.json`.
2. **Download Options:**  
   Adjust any settings or provide URLs in the configuration or via CLI as required.

## Contributing
Pull requests and suggestions are welcome!

## Roadmap / TODO
- [ ] Set up proper REST API to get the JSON data instead of changing the dummy data
- [ ] Add error handling and retry logic for API requests
- [ ] Enhance batch download capabilities (progress display, parallel downloads)
- [ ] Improve configuration options (CLI flags, config file)
- [ ] Add logging and user-friendly output

## License
This project is for personal use only. Please respect KukuFM's terms of service.

---