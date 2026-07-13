import React, { useState, useEffect } from 'react';
import './BisitaNVBanner.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LaunchIcon from '@mui/icons-material/Launch';
import ExploreIcon from '@mui/icons-material/Explore';

export default function BisitaNVBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem('bisita_banner_collapsed');
    if (collapsed === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleCollapseToggle = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('bisita_banner_collapsed', String(nextVal));
  };

  const destinationLink = "https://sia-tourism-management-system-2.onrender.com/";

  if (isCollapsed) {
    return (
      <div className="bisita-banner-collapsed animate-fade-in">
        <div className="bisita-collapsed-content">
          <ExploreIcon className="bisita-icon-spin" sx={{ color: '#052e16', fontSize: 18 }} />
          <span className="bisita-collapsed-text">
            Planning your next trip? Discover destinations & packages on{' '}
            <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="bisita-brand-link">
              Bisita NV <LaunchIcon sx={{ fontSize: 12, ml: 0.3, verticalAlign: 'middle' }} />
            </a>
          </span>
        </div>
        <div className="bisita-banner-controls">
          <button 
            onClick={handleCollapseToggle} 
            className="bisita-control-btn" 
            title="Expand Banner"
            aria-label="Expand banner"
          >
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bisita-banner-expanded animate-slide-down">
      <div className="bisita-accent-line"></div>
      
      <div className="bisita-expanded-body">
        <div className="bisita-main-info">
          <div className="bisita-header-group">
            <ExploreIcon sx={{ color: '#052e16', fontSize: 22 }} />
            <h3 className="bisita-title">Bisita NV</h3>
          </div>
          
          <p className="bisita-description">
            Discover breathtaking destinations, reserve custom travel packages, and manage your travel bookings with a clean experience built for Nueva Vizcaya.
          </p>
        </div>

        <div className="bisita-action-column">
          <a 
            href={destinationLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bisita-cta-button"
          >
            Get Started <LaunchIcon sx={{ fontSize: 14, ml: 0.5 }} />
          </a>
        </div>
      </div>

      <div className="bisita-banner-controls absolute-controls">
        <button 
          onClick={handleCollapseToggle} 
          className="bisita-control-btn" 
          title="Collapse Banner"
          aria-label="Collapse banner"
        >
          <ExpandLessIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
