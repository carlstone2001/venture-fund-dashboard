# Venture Fund Dashboard

A real-time dashboard for tracking publicly traded venture capital funds, BDCs, and interval funds.

## Features

- Real-time price tracking via Yahoo Finance API
- 10 pre-configured venture funds
- Market cap calculations and NAV comparisons
- Premium/discount analysis
- Sortable data table with key metrics
- Responsive Material-UI design

## Live Demo

🚀 **[Live Dashboard](https://venture-fund-dashboard.vercel.app)**

## Local Development

1. Clone and install:
```bash
npm install
cd client && npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment to Vercel

This project is optimized for Vercel deployment:

1. **GitHub Integration**: Push to GitHub and connect to Vercel
2. **Serverless Functions**: API routes in `/api/` directory
3. **React Build**: Automatic React build process
4. **Database**: SQLite database included in deployment

### Environment Variables

No environment variables required for basic functionality.

### Build Configuration

- **Framework**: React (Create React App)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install`

## API Endpoints

- `GET /api/funds` - Get all fund data
- `GET /api/funds/[symbol]` - Get specific fund details
- `POST /api/update-prices` - Trigger price update

## Database Schema

The SQLite database includes:
- **funds**: Fund details and metadata
- **price_data**: Historical pricing data
- **management_data**: Management fees and ownership

## Tech Stack

- **Frontend**: React 18, Material-UI 5, Recharts
- **Backend**: Serverless functions (Node.js)
- **Database**: SQLite
- **APIs**: Yahoo Finance
- **Deployment**: Vercel

## Maintenance

To update fund data:
1. Access the live dashboard
2. Click "Update Prices" button
3. Prices refresh automatically every 5 minutes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details