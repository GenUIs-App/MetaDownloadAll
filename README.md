# MetaDownloadAll

A comprehensive application for downloading media content from various sources.

## Features

- [x] Facebook Media Download
- [x] Instagram Media Download
- [x] Twitter Media Download
- [ ] YouTube Media Download (Coming Soon)
- [x] TikTok Media Download (New!)
- [x] Advanced Account Management
  - [x] Multi-platform account support
  - [x] Auto-extraction of usernames
  - [x] Collapsible account editing

## Project Structure

```
.
├── be/         # Backend services
│   └── data/   # Data files
│       └── urls.txt  # List of account URLs
└── fe/         # Frontend application
    ├── src/    # Source code
    │   ├── api/    # API utilities
    │   │   └── urls.ts  # URL list API
    │   ├── components/  # React components
    │   │   └── AccountList.tsx  # Account list UI
    │   └── config.ts   # Environment configuration
    ├── public/ # Static assets
    └── ...     # Configuration files
```

## Project Structure

```
.
├── be/         # Backend services
└── fe/         # Frontend application
    ├── src/    # Source code
    ├── public/ # Static assets
    └── ...     # Configuration files
```

## Getting Started

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the application

## Development

### Frontend

```bash
cd fe
npm install
npm run dev
```

### Backend

```bash
cd be
npm install
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file

## Updates

### [2025-05-27] - Enhanced Account Management
- Added TikTok support for account management
- Implemented auto-extraction of usernames from URLs
- Added collapsible account editing interface
- Created scrollable account list sorted by newest first
- Added timestamp tracking for account creation and updates
- Made Facebook links optional (any social media platform can be used)
- Improved UI with direct links to social media profiles

### [2025-05-27] - Initial Release
- Initial project setup
- Basic frontend structure
- Facebook media download functionality
