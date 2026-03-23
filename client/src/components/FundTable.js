import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px 0;
`;

const TableHeader = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 80vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const TableHead = styled.thead`
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
  
  &:nth-child(even) {
    background: #fdfdfd;
  }
  
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
`;

const TableCell = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  text-align: ${props => props.align || 'left'};
  white-space: nowrap;
  
  &.fund-name {
    min-width: 200px;
    
    .symbol {
      font-weight: bold;
      color: #667eea;
    }
    
    .name {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
  }
  
  &.price {
    font-weight: bold;
    color: #2d3436;
  }
  
  &.premium {
    font-weight: bold;
    color: ${props => {
      if (props.value > 0) return '#e74c3c'; // Red for premium
      if (props.value < 0) return '#27ae60'; // Green for discount
      return '#2d3436';
    }};
  }
  
  &.change {
    font-weight: bold;
    color: ${props => {
      if (props.value > 0) return '#27ae60';
      if (props.value < 0) return '#e74c3c';
      return '#2d3436';
    }};
  }
`;

const HeaderCell = styled.th`
  padding: 15px 8px;
  text-align: ${props => props.align || 'left'};
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  border-bottom: 2px solid #dee2e6;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  
  &:hover {
    background: ${props => props.sortable ? '#e9ecef' : '#f8f9fa'};
  }
  
  .sort-indicator {
    margin-left: 4px;
    opacity: 0.5;
  }
  
  &.active .sort-indicator {
    opacity: 1;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  
  &.cef {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.bdc {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  
  &.interval {
    background: #e8f5e8;
    color: #2e7d32;
  }
  
  &.public-vc {
    background: #fff3e0;
    color: #f57c00;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
    background: #f0f0f0;
  }
`;

const FundTable = ({ funds, onFundSelect, onRefreshFund }) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: 'market_cap', 
    direction: 'desc' 
  });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'desc' 
      ? 'asc' 
      : 'desc';
    setSortConfig({ key, direction });
  };

  const sortedFunds = useMemo(() => {
    if (!sortConfig.key) return funds;

    return [...funds].sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [funds, sortConfig]);

  const formatNumber = (value, type = 'number') => {
    if (value === null || value === undefined) return '-';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: value > 1e9 ? 'compact' : 'standard',
        compactDisplay: 'short'
      }).format(value);
    }
    
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    
    if (type === 'number' && value > 1e6) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
    
    return value.toFixed(2);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'desc' ? '↓' : '↑';
  };

  const getBadgeClass = (type) => {
    return type.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <TableContainer>
      <TableHeader>
        <h2>All Funds - Detailed View</h2>
        <p>
          Showing {funds.length} venture capital funds, BDCs, and interval funds
          • Click column headers to sort • Click rows for details
        </p>
      </TableHeader>
      
      <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <HeaderCell 
                sortable 
                onClick={() => handleSort('symbol')}
                className={sortConfig.key === 'symbol' ? 'active' : ''}
              >
                Fund
                <span className="sort-indicator">{getSortIndicator('symbol')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                onClick={() => handleSort('fund_type')}
                className={sortConfig.key === 'fund_type' ? 'active' : ''}
              >
                Type
                <span className="sort-indicator">{getSortIndicator('fund_type')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('price')}
                className={sortConfig.key === 'price' ? 'active' : ''}
              >
                Price
                <span className="sort-indicator">{getSortIndicator('price')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('market_cap')}
                className={sortConfig.key === 'market_cap' ? 'active' : ''}
              >
                Market Cap
                <span className="sort-indicator">{getSortIndicator('market_cap')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('nav')}
                className={sortConfig.key === 'nav' ? 'active' : ''}
              >
                NAV
                <span className="sort-indicator">{getSortIndicator('nav')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('premium_discount')}
                className={sortConfig.key === 'premium_discount' ? 'active' : ''}
              >
                Premium/Discount
                <span className="sort-indicator">{getSortIndicator('premium_discount')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('aum')}
                className={sortConfig.key === 'aum' ? 'active' : ''}
              >
                AUM
                <span className="sort-indicator">{getSortIndicator('aum')}</span>
              </HeaderCell>
              
              <HeaderCell 
                sortable 
                align="right"
                onClick={() => handleSort('dividend_yield')}
                className={sortConfig.key === 'dividend_yield' ? 'active' : ''}
              >
                Div. Yield
                <span className="sort-indicator">{getSortIndicator('dividend_yield')}</span>
              </HeaderCell>
              
              <HeaderCell align="center">
                Actions
              </HeaderCell>
            </tr>
          </TableHead>
          
          <tbody>
            {sortedFunds.map((fund) => (
              <TableRow 
                key={fund.symbol} 
                clickable
                onClick={() => onFundSelect(fund)}
              >
                <TableCell className="fund-name">
                  <div className="symbol">{fund.symbol}</div>
                  <div className="name">{fund.name}</div>
                </TableCell>
                
                <TableCell>
                  <Badge className={getBadgeClass(fund.fund_type)}>
                    {fund.fund_type}
                  </Badge>
                </TableCell>
                
                <TableCell className="price" align="right">
                  ${formatNumber(fund.price)}
                </TableCell>
                
                <TableCell align="right">
                  {formatNumber(fund.market_cap, 'currency')}
                </TableCell>
                
                <TableCell align="right">
                  {fund.nav ? `$${formatNumber(fund.nav)}` : '-'}
                </TableCell>
                
                <TableCell 
                  className="premium" 
                  align="right"
                  value={fund.premium_discount}
                >
                  {fund.premium_discount !== null 
                    ? formatNumber(fund.premium_discount, 'percentage')
                    : '-'
                  }
                </TableCell>
                
                <TableCell align="right">
                  {formatNumber(fund.aum, 'currency')}
                </TableCell>
                
                <TableCell align="right">
                  {fund.dividend_yield 
                    ? formatNumber(fund.dividend_yield * 100, 'percentage')
                    : '-'
                  }
                </TableCell>
                
                <TableCell align="center">
                  <RefreshButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshFund(fund.symbol);
                    }}
                    title="Refresh this fund"
                  >
                    🔄
                  </RefreshButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

export default FundTable;