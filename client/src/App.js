import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('market_cap');
  const [sortDirection, setSortDirection] = useState('desc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const response = await axios.get('/api/funds');
      setFunds(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch fund data');
      console.error('Error fetching funds:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = async () => {
    setUpdating(true);
    try {
      const response = await axios.post('/api/update-prices');
      setSnackbar({
        open: true,
        message: `Updated ${response.data.updates.length} funds`,
        severity: 'success'
      });
      await fetchFunds(); // Refresh data
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update prices',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedFunds = [...funds].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = 0;
    if (bVal === null || bVal === undefined) bVal = 0;
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const getFundTypeColor = (type) => {
    switch (type) {
      case 'CEF': return 'primary';
      case 'BDC': return 'secondary';
      case 'Interval Fund': return 'info';
      case 'Public VC': return 'warning';
      default: return 'default';
    }
  };

  const getTrendIcon = (change) => {
    if (!change) return null;
    return change >= 0 ? 
      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> :
      <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />;
  };

  const calculateSummaryStats = () => {
    const totalMarketCap = funds.reduce((sum, fund) => sum + (fund.market_cap || 0), 0);
    const avgPremium = funds.filter(f => f.premium_discount).reduce((sum, fund, _, arr) => 
      sum + (fund.premium_discount / arr.length), 0);
    
    return {
      totalFunds: funds.length,
      totalMarketCap,
      avgPremium: isNaN(avgPremium) ? 0 : avgPremium,
      activeFunds: funds.filter(f => f.price).length
    };
  };

  const stats = calculateSummaryStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Private Venture Fund Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={updatePrices}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Prices'}
          </Button>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Real-time tracking of publicly traded venture capital funds, BDCs, and interval funds
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Funds
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalFunds}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.activeFunds} with live prices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Market Cap
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatCurrency(stats.totalMarketCap)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Combined market value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Avg Premium/Discount
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" 
                sx={{ color: stats.avgPremium >= 0 ? 'success.main' : 'error.main' }}>
                {formatPercent(stats.avgPremium)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                To NAV (where available)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Last Updated
              </Typography>
              <Typography variant="h6" component="div" fontWeight="bold">
                {new Date().toLocaleTimeString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date().toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'symbol'}
                    direction={sortField === 'symbol' ? sortDirection : 'asc'}
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol
                  </TableSortLabel>
                </TableCell>
                <TableCell>Fund Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'price'}
                    direction={sortField === 'price' ? sortDirection : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'market_cap'}
                    direction={sortField === 'market_cap' ? sortDirection : 'asc'}
                    onClick={() => handleSort('market_cap')}
                  >
                    Market Cap
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'nav'}
                    direction={sortField === 'nav' ? sortDirection : 'asc'}
                    onClick={() => handleSort('nav')}
                  >
                    NAV
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'mnav'}
                    direction={sortField === 'mnav' ? sortDirection : 'asc'}
                    onClick={() => handleSort('mnav')}
                  >
                    MNAV
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'premium_discount'}
                    direction={sortField === 'premium_discount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('premium_discount')}
                  >
                    Premium/Discount
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'dividend_yield'}
                    direction={sortField === 'dividend_yield' ? sortDirection : 'asc'}
                    onClick={() => handleSort('dividend_yield')}
                  >
                    Yield
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'management_fee'}
                    direction={sortField === 'management_fee' ? sortDirection : 'asc'}
                    onClick={() => handleSort('management_fee')}
                  >
                    Mgmt Fee
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFunds.map((fund) => (
                <TableRow key={fund.symbol} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        {fund.symbol}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {fund.exchange}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{fund.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {fund.management_company}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={fund.fund_type} 
                      size="small" 
                      color={getFundTypeColor(fund.fund_type)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      {fund.price ? formatCurrency(fund.price) : 'N/A'}
                      {getTrendIcon(0)} {/* Would show actual change */}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(fund.market_cap)}
                  </TableCell>
                  <TableCell align="right">
                    {fund.nav ? formatCurrency(fund.nav) : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {fund.mnav ? fund.mnav.toFixed(2) + 'x' : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: fund.premium_discount >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {formatPercent(fund.premium_discount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatPercent(fund.dividend_yield)}
                  </TableCell>
                  <TableCell align="right">
                    {formatPercent(fund.management_fee)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="textSecondary">
          Data sources: Yahoo Finance, SEC EDGAR, Company Reports | 
          Prices update every 5 minutes during market hours | 
          NAV data updated quarterly
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;