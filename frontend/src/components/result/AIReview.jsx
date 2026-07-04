import React from 'react';

const AIReview = ({ reviewText }) => {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '18px', marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', color: '#ff6b2b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '600' }}>
        AI post-match review
      </div>
      <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.9' }}>
        {reviewText || "Analyzing both submissions..."}
      </div>
    </div>
  );
};

export default AIReview;