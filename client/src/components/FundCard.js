import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      if (props.highlight === 'premium') return 'linear-gradient(90deg, #ff4757, #ff3838)';
      if (props.highlight === 'discount') return 'linear-gradient(90deg, #2ed573, #7bed9f)';
      if (props.fundType === 'CEF') return 'linear-gradient(90deg, #667eea, #764ba2)';
      if (props.fundType === 'BDC') return 'linear-gradient(90deg, #f093fb, #f5576c)';
      if (props.fundType === 'Interval Fund') return 'linear-gradient(90deg, #4facfe, #00f2fe)';
      return 'linear-gradient(90deg, #ffeaa7, #fdcb6e)';
    }};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const Symbol = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #2d3436;
`;

const Exchange = styled.span`
  background: #ddd;
  color: #2d3436;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const Name = styled.p`
  color: #636e72;
  font-size: 12px;
  margin: 5px 0 0 0;
  line-height: 1.3;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 20px;
  margin: 15px 0;
`;

const Metric = styled.div`
  .label {
    font-size: 11px;
    color: #636e72;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 16px;
    font-weight: bold;
    color: #2d3436;
    
    &.price {
      font-size: 18px;
      color: #0984e3;
    }
    
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
`;

const TypeBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: ${props => {
    if (props.type === 'CEF') return 'rgba(102, 126, 234, 0.1)';
    if (props.type === 'BDC') return 'rgba(240, 147, 251, 0.1)';
    if (props.type === 'Interval Fund') return 'rgba(79, 172, 254, 0.1)';
    return 'rgba(255, 234, 167, 0.1)';
  }};
  color: ${props => {
    if (props.type === 'CEF') return '#667eea';
    if (props.type === 'BDC') return '#f093fb';
    if (props.type === 'Interval Fund') return '#4facfe';
    return '#fdcb6e';
  }};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

const LastUpdate = styled.span`
  font-size: 10px;
  color: #636e72;
`;

const HighlightBadge = styled.span`
  background: ${props => {
    if (props.type === 'premium') return 'rgba(231, 76, 60, 0.1)';
    if (props.type === 'discount') return 'rgba(39, 174, 96, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.type === 'premium') return '#e74c3c';
    if (props.type === 'discount') return '#27ae60';
    return '#2d3436';
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const FundCard = ({ fund, onClick, highlight }) => {
  const formatNumber = (value, type = 'number') => {
    if (value === null || value === undefined) return '-';
    
    if (type === 'currency') {
      if (value > 1e9) {
        return `$${(value / 1e9).toFixed(1)}B`;
      } else if (value > 1e6) {
        return `$${(value / 1e6).toFixed(1)}M`;
      } else {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
    }
    
    if (type === 'percentage') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
    
    return value.toFixed(2);
  };

  const getTimeSinceUpdate = (dateString) => {
    if (!dateString) return 'No data';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const hasPrice = fund.price !== null && fund.price !== undefined;
  const hasNAV = fund.nav !== null && fund.nav !== undefined;
  const hasPremiumDiscount = fund.premium_discount !== null && fund.premium_discount !== undefined;

  return (
    <Card 
      onClick={onClick}
      highlight={highlight}
      fundType={fund.fund_type}
    >
      <TypeBadge type={fund.fund_type}>
        {fund.fund_type}
      </TypeBadge>
      
      <Header>
        <div>
          <Symbol>{fund.symbol}</Symbol>
          <Name>{fund.name}</Name>
        </div>
        <Exchange>{fund.exchange}</Exchange>
      </Header>

      <MetricsGrid>
        <Metric>
          <div className="label">Price</div>
          <div className="value price">
            {hasPrice ? `$${formatNumber(fund.price)}` : 'N/A'}
          </div>
        </Metric>

        <Metric value={fund.premium_discount}>
          <div className="label">Premium/Discount</div>
          <div className={`value premium ${fund.premium_discount > 0 ? 'positive' : fund.premium_discount < 0 ? 'negative' : ''}`}>
            {hasPremiumDiscount ? formatNumber(fund.premium_discount, 'percentage') : '-'}
          </div>
        </Metric>

        <Metric>
          <div className="label">Market Cap</div>
          <div className="value">
            {fund.market_cap ? formatNumber(fund.market_cap, 'currency') : '-'}
          </div>
        </Metric>

        <Metric>
          <div className="label">NAV</div>
          <div className="value">
            {hasNAV ? `$${formatNumber(fund.nav)}` : '-'}
          </div>
        </Metric>
      </MetricsGrid>

      <BottomRow>
        <LastUpdate>
          Updated {getTimeSinceUpdate(fund.created_at)}
        </LastUpdate>
        
        {highlight && (
          <HighlightBadge type={highlight}>
            {highlight === 'premium' ? 'High Premium' : 'Big Discount'}
          </HighlightBadge>
        )}
      </BottomRow>
    </Card>
  );
};

export default FundCard;