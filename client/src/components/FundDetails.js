import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DetailsContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px 0;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  position: relative;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FundTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
`;

const TitleLeft = styled.div`
  h1 {
    font-size: 32px;
    margin: 0 0 8px 0;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin: 0;
  }
  
  .exchange {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    margin-top: 10px;
    display: inline-block;
  }
`;

const TitleRight = styled.div`
  text-align: right;
  
  .current-price {
    font-size: 36px;
    font-weight: bold;
    margin: 0;
  }
  
  .price-subtitle {
    font-size: 14px;
    opacity: 0.8;
    margin: 5px 0;
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Content = styled.div`
  padding: 30px;
`;

const MetricsSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: #2d3436;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  
  .label {
    font-size: 12px;
    color: #636e72;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 24px;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 4px;
    
    &.premium {
      color: ${props => {
        if (props.value > 0) return '#e74c3c';
        if (props.value < 0) return '#27ae60';
        return '#2d3436';
      }};
    }
    
    &.positive {
      color: #27ae60;
    }
    
    &.negative {
      color: #e74c3c;
    }
  }
  
  .change {
    font-size: 12px;
    color: #636e72;
  }
`;

const HistorySection = styled.div`
  margin: 40px 0;
`;

const HistoryChart = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #636e72;
  font-size: 14px;
`;

const InfoSection = styled.div`
  margin: 40px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  
  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #2d3436;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-size: 13px;
      color: #636e72;
    }
    
    .value {
      font-size: 13px;
      font-weight: 600;
      color: #2d3436;
    }
  }
`;

const WarningBanner = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  color: #856404;
  font-size: 14px;
  
  .title {
    font-weight: bold;
    margin-bottom: 5px;
  }
`;

const FundDetails = ({ fund, onBack, onRefresh }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fund.symbol]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/funds/${fund.symbol}?days=30`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value, type = 'number') => {
    if (value === null || value === undefined) return '-';
    
    if (type === 'currency') {
      if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
      } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(1)}M`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    
    if (type === 'percentage') {
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    
    return value.toFixed(2);
  };

  const calculateMNAV = () => {
    if (!fund.market_cap || !fund.nav || !fund.price) return null;
    const impliedAUM = fund.nav * (fund.market_cap / fund.price);
    return fund.market_cap / impliedAUM;
  };

  const isHighPremium = fund.premium_discount && fund.premium_discount > 50;
  const isNewFund = new Date() - new Date(fund.creation_date) < 90 * 24 * 60 * 60 * 1000; // 90 days

  return (
    <DetailsContainer>
      <Header>
        <BackButton onClick={onBack}>← Back to Dashboard</BackButton>
        
        <RefreshButton onClick={onRefresh}>
          🔄 Refresh Data
        </RefreshButton>
        
        <FundTitle>
          <TitleLeft>
            <h1>{fund.symbol}</h1>
            <p className="subtitle">{fund.name}</p>
            <span className="exchange">{fund.exchange} • {fund.fund_type}</span>
          </TitleLeft>
          
          <TitleRight>
            {fund.price && (
              <>
                <div className="current-price">
                  ${formatNumber(fund.price)}
                </div>
                <div className="price-subtitle">Current Price</div>
              </>
            )}
          </TitleRight>
        </FundTitle>
      </Header>

      <Content>
        {isHighPremium && (
          <WarningBanner>
            <div className="title">⚠️ High Premium Warning</div>
            This fund is trading at a significant premium to NAV ({formatNumber(fund.premium_discount, 'percentage')}). 
            Consider the risks of paying above intrinsic value.
          </WarningBanner>
        )}

        {isNewFund && (
          <WarningBanner>
            <div className="title">🆕 New Fund</div>
            This is a recently launched fund with limited trading history. 
            Expect higher volatility and limited performance data.
          </WarningBanner>
        )}

        <MetricsSection>
          <SectionTitle>📊 Key Metrics</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <div className="label">Market Capitalization</div>
              <div className="value">
                {formatNumber(fund.market_cap, 'currency')}
              </div>
            </MetricCard>

            <MetricCard>
              <div className="label">Net Asset Value (NAV)</div>
              <div className="value">
                {fund.nav ? `$${formatNumber(fund.nav)}` : 'Not Available'}
              </div>
            </MetricCard>

            <MetricCard value={fund.premium_discount}>
              <div className="label">Premium / Discount</div>
              <div className={`value premium`}>
                {fund.premium_discount !== null 
                  ? formatNumber(fund.premium_discount, 'percentage')
                  : 'Not Available'
                }
              </div>
            </MetricCard>

            <MetricCard>
              <div className="label">Assets Under Management</div>
              <div className="value">
                {formatNumber(fund.aum, 'currency')}
              </div>
            </MetricCard>

            <MetricCard>
              <div className="label">MNAV Multiple</div>
              <div className="value">
                {calculateMNAV() ? `${formatNumber(calculateMNAV())}x` : 'N/A'}
              </div>
            </MetricCard>

            <MetricCard>
              <div className="label">Dividend Yield</div>
              <div className="value">
                {fund.dividend_yield 
                  ? formatNumber(fund.dividend_yield * 100, 'percentage')
                  : 'Not Available'
                }
              </div>
            </MetricCard>
          </MetricsGrid>
        </MetricsSection>

        <HistorySection>
          <SectionTitle>📈 Price History (30 Days)</SectionTitle>
          <HistoryChart>
            {loading ? (
              'Loading price history...'
            ) : history.length > 0 ? (
              'Chart visualization would go here (integrate with Recharts)'
            ) : (
              'No historical data available yet'
            )}
          </HistoryChart>
        </HistorySection>

        <InfoSection>
          <SectionTitle>ℹ️ Fund Information</SectionTitle>
          <InfoGrid>
            <InfoCard>
              <h3>Fund Details</h3>
              <div className="info-item">
                <span className="label">Fund Type</span>
                <span className="value">{fund.fund_type}</span>
              </div>
              <div className="info-item">
                <span className="label">Category</span>
                <span className="value">{fund.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Management Company</span>
                <span className="value">{fund.management_company}</span>
              </div>
              <div className="info-item">
                <span className="label">Exchange</span>
                <span className="value">{fund.exchange}</span>
              </div>
              <div className="info-item">
                <span className="label">Minimum Investment</span>
                <span className="value">
                  {fund.minimum_investment > 0 
                    ? formatNumber(fund.minimum_investment, 'currency')
                    : 'None'
                  }
                </span>
              </div>
            </InfoCard>

            <InfoCard>
              <h3>Investment Focus</h3>
              <div className="info-item">
                <span className="label">Strategy</span>
                <span className="value">
                  {fund.fund_type === 'CEF' ? 'Private Venture Capital' :
                   fund.fund_type === 'BDC' ? 'Direct Lending & Equity' :
                   fund.fund_type === 'Interval Fund' ? 'Private Markets Access' :
                   'Public & Private Growth'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Geographic Focus</span>
                <span className="value">
                  {fund.exchange === 'LSE' ? 'Europe' : 'United States'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Liquidity</span>
                <span className="value">
                  {fund.fund_type === 'Interval Fund' ? 'Quarterly' : 'Daily'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Last Updated</span>
                <span className="value">
                  {fund.created_at 
                    ? new Date(fund.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </InfoCard>
          </InfoGrid>
        </InfoSection>
      </Content>
    </DetailsContainer>
  );
};

export default FundDetails;