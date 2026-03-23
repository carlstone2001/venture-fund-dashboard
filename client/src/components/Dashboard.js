import React from 'react';
import styled from 'styled-components';
import FundCard from './FundCard';
import StatsOverview from './StatsOverview';

const DashboardContainer = styled.div`
  padding: 0;
`;

const StatsSection = styled.section`
  margin-bottom: 30px;
`;

const FundsSection = styled.section`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  
  .subtitle {
    font-size: 14px;
    font-weight: normal;
    opacity: 0.8;
    margin-left: 10px;
  }
`;

const FundGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  .icon {
    font-size: 24px;
    margin-right: 10px;
  }
  
  .title {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
  
  .count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    margin-left: 10px;
  }
`;

const Dashboard = ({ funds, stats, onFundSelect }) => {
  // Group funds by category
  const fundsByCategory = React.useMemo(() => {
    const categories = {
      'venture-cefs': {
        title: 'Venture Capital CEFs',
        icon: '🚀',
        description: 'Closed-end funds investing in private venture companies',
        funds: funds.filter(f => f.fund_type === 'CEF' && f.category === 'Venture Capital')
      },
      'bdcs': {
        title: 'Business Development Companies',
        icon: '🏢',
        description: 'Direct lending and equity investments in middle market',
        funds: funds.filter(f => f.fund_type === 'BDC')
      },
      'interval-funds': {
        title: 'Interval Funds',
        icon: '📅',
        description: 'Quarterly liquidity funds with venture exposure',
        funds: funds.filter(f => f.fund_type === 'Interval Fund')
      },
      'international': {
        title: 'International Funds',
        icon: '🌍',
        description: 'European and global venture capital funds',
        funds: funds.filter(f => f.exchange === 'LSE' || f.fund_type === 'Public VC')
      }
    };
    
    return categories;
  }, [funds]);

  // Sort funds within each category by market cap
  Object.values(fundsByCategory).forEach(category => {
    category.funds.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
  });

  // Get top performers for highlights
  const topPerformers = React.useMemo(() => {
    return funds
      .filter(f => f.premium_discount !== null)
      .sort((a, b) => b.premium_discount - a.premium_discount)
      .slice(0, 3);
  }, [funds]);

  const biggestDiscounts = React.useMemo(() => {
    return funds
      .filter(f => f.premium_discount !== null && f.premium_discount < 0)
      .sort((a, b) => a.premium_discount - b.premium_discount)
      .slice(0, 3);
  }, [funds]);

  return (
    <DashboardContainer>
      <StatsSection>
        <SectionTitle>
          📊 Market Overview
          <span className="subtitle">Real-time venture fund tracking</span>
        </SectionTitle>
        <StatsOverview stats={stats} funds={funds} />
      </StatsSection>

      {/* Highlighted Funds */}
      {topPerformers.length > 0 && (
        <CategorySection>
          <CategoryHeader>
            <span className="icon">🔥</span>
            <h3 className="title">Highest Premiums</h3>
            <span className="count">{topPerformers.length}</span>
          </CategoryHeader>
          <FundGrid>
            {topPerformers.map(fund => (
              <FundCard
                key={fund.symbol}
                fund={fund}
                onClick={() => onFundSelect(fund)}
                highlight="premium"
              />
            ))}
          </FundGrid>
        </CategorySection>
      )}

      {biggestDiscounts.length > 0 && (
        <CategorySection>
          <CategoryHeader>
            <span className="icon">💰</span>
            <h3 className="title">Biggest Discounts</h3>
            <span className="count">{biggestDiscounts.length}</span>
          </CategoryHeader>
          <FundGrid>
            {biggestDiscounts.map(fund => (
              <FundCard
                key={fund.symbol}
                fund={fund}
                onClick={() => onFundSelect(fund)}
                highlight="discount"
              />
            ))}
          </FundGrid>
        </CategorySection>
      )}

      {/* Fund Categories */}
      <FundsSection>
        {Object.entries(fundsByCategory).map(([key, category]) => {
          if (category.funds.length === 0) return null;

          return (
            <CategorySection key={key}>
              <CategoryHeader>
                <span className="icon">{category.icon}</span>
                <h3 className="title">{category.title}</h3>
                <span className="count">{category.funds.length}</span>
              </CategoryHeader>
              
              <FundGrid>
                {category.funds.map(fund => (
                  <FundCard
                    key={fund.symbol}
                    fund={fund}
                    onClick={() => onFundSelect(fund)}
                  />
                ))}
              </FundGrid>
            </CategorySection>
          );
        })}
      </FundsSection>
    </DashboardContainer>
  );
};

export default Dashboard;