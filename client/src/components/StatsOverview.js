import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.9;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const StatSubtext = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  line-height: 1.3;
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const QuickStatCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
`;

const QuickStatTitle = styled.h4`
  color: white;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
`;

const QuickStatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const QuickStatItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  .symbol {
    font-weight: bold;
    color: white;
  }
  
  .value {
    font-weight: 600;
  }
`;

const StatsOverview = ({ stats, funds }) => {
  const formatNumber = (value, type = 'number') => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    
    if (type === 'currency') {
      if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(1)}B`;
      } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(1)}M`;
      }
      return `$${(value / 1e3).toFixed(0)}K`;
    }
    
    if (type === 'percentage') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
    
    if (type === 'count') {
      return value.toString();
    }
    
    return value.toFixed(0);
  };

  // Calculate additional statistics
  const activeFunds = funds.filter(f => f.price !== null);
  const cefsWithPremium = funds.filter(f => 
    f.fund_type === 'CEF' && 
    f.premium_discount !== null && 
    f.premium_discount > 0
  );
  
  const totalAUM = funds
    .filter(f => f.aum)
    .reduce((sum, f) => sum + f.aum, 0);

  const avgDividendYield = funds
    .filter(f => f.dividend_yield && f.fund_type === 'BDC')
    .reduce((sum, f) => sum + f.dividend_yield, 0) / 
    funds.filter(f => f.dividend_yield && f.fund_type === 'BDC').length;

  // Top funds by market cap
  const topFundsByMarketCap = funds
    .filter(f => f.market_cap)
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, 5);

  // Funds by type breakdown
  const fundsByType = stats?.fundsByType || {};

  return (
    <>
      <StatsContainer>
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatValue>{stats?.totalFunds || activeFunds.length}</StatValue>
          <StatLabel>Total Funds</StatLabel>
          <StatSubtext>Actively tracking venture capital funds</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatValue>{formatNumber(stats?.totalMarketCap || 0, 'currency')}</StatValue>
          <StatLabel>Total Market Cap</StatLabel>
          <StatSubtext>Combined value of tracked funds</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>📈</StatIcon>
          <StatValue>{formatNumber(stats?.avgPremiumDiscount || 0, 'percentage')}</StatValue>
          <StatLabel>Avg Premium</StatLabel>
          <StatSubtext>
            {cefsWithPremium.length} CEFs trading at premium
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>🏦</StatIcon>
          <StatValue>{formatNumber(totalAUM, 'currency')}</StatValue>
          <StatLabel>Total AUM</StatLabel>
          <StatSubtext>Assets under management</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>💎</StatIcon>
          <StatValue>{formatNumber((avgDividendYield || 0) * 100, 'percentage')}</StatValue>
          <StatLabel>Avg BDC Yield</StatLabel>
          <StatSubtext>Average dividend yield for BDCs</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>🔄</StatIcon>
          <StatValue>{formatNumber(activeFunds.length, 'count')}</StatValue>
          <StatLabel>Live Data</StatLabel>
          <StatSubtext>Funds with current pricing</StatSubtext>
        </StatCard>
      </StatsContainer>

      <QuickStatsGrid>
        <QuickStatCard>
          <QuickStatTitle>🎯 Fund Types</QuickStatTitle>
          <QuickStatList>
            <QuickStatItem>
              <span>Closed-End Funds (CEF)</span>
              <span className="value">{fundsByType.CEF || 0}</span>
            </QuickStatItem>
            <QuickStatItem>
              <span>Business Development (BDC)</span>
              <span className="value">{fundsByType.BDC || 0}</span>
            </QuickStatItem>
            <QuickStatItem>
              <span>Interval Funds</span>
              <span className="value">{fundsByType['Interval Fund'] || 0}</span>
            </QuickStatItem>
            <QuickStatItem>
              <span>Public VC</span>
              <span className="value">{fundsByType['Public VC'] || 0}</span>
            </QuickStatItem>
          </QuickStatList>
        </QuickStatCard>

        <QuickStatCard>
          <QuickStatTitle>🏆 Top 5 by Market Cap</QuickStatTitle>
          <QuickStatList>
            {topFundsByMarketCap.map((fund, index) => (
              <QuickStatItem key={fund.symbol}>
                <span>
                  <span className="symbol">{fund.symbol}</span>
                </span>
                <span className="value">
                  {formatNumber(fund.market_cap, 'currency')}
                </span>
              </QuickStatItem>
            ))}
            {topFundsByMarketCap.length === 0 && (
              <QuickStatItem>
                <span>No market cap data available</span>
                <span className="value">-</span>
              </QuickStatItem>
            )}
          </QuickStatList>
        </QuickStatCard>
      </QuickStatsGrid>
    </>
  );
};

export default StatsOverview;