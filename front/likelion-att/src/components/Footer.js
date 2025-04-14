// src/components/Footer.js
import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
        height: '10vh',
      textAlign: 'center',
      padding: '15px 0',
      borderTop: '1px solid #eaeaea',
      backgroundColor: '#f8f9fa',
      width: '100%'
    }}>
      <div>
        <a 
          href="https://github.com/dongsubnambuk/likelion_att" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#444',
            textDecoration: 'none',
            marginBottom: '8px'
          }}
        >
          <FaGithub style={{ marginRight: '6px' }} /> GitHub Repository
        </a>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        © {currentYear} 계명대학교 멋쟁이사자처럼 13기. made by Son & Han.
      </div>
    </footer>
  );
};

export default Footer;