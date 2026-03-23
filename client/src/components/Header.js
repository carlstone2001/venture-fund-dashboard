import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const NavButton = styled.button`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled(NavButton)`
  background: ${props => props.isLoading ? 'rgba(255, 193, 7, 0.3)' : 'rgba(40, 167, 69, 0.3)'};
  border-color: ${props => props.isLoading ? 'rgba(255, 193, 7, 0.5)' : 'rgba(40, 167, 69, 0.5)'};
  
  &:hover {
    background: ${props => props.isLoading ? 'rgba(255, 193, 7, 0.4)' : 'rgba(40, 167, 69, 0.4)'};
  }
`;

const StatusInfo = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-align: right;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffc107;
  animation: pulse 1.5s infinite;
  margin-left: 8px;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const Header = ({ 
  onRefresh, 
  onViewChange, 
  activeView, 
  lastUpdated, 
  isLoading 
}) => {
  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Title>Venture Fund Dashboard</Title>
        
        <Nav>
          <NavButton
            active={activeView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
          >
            📊 Dashboard
          </NavButton>
          <NavButton
            active={activeView === 'table'}
            onClick={() => onViewChange('table')}
          >
            📋 Table View
          </NavButton>
          <RefreshButton
            onClick={onRefresh}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? '🔄 Updating...' : '🔄 Refresh All'}
          </RefreshButton>
        </Nav>
        
        <StatusInfo>
          <div>Last updated: {formatLastUpdated(lastUpdated)}</div>
          <div>
            {isLoading && (
              <>
                Updating data
                <LoadingDot />
              </>
            )}
            {!isLoading && 'Live data'}
          </div>
        </StatusInfo>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;