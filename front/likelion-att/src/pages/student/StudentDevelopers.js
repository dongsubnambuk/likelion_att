// src/pages/student/StudentDevelopers.js
import React from 'react';
import { FaGithub, FaCode, FaLaptopCode, FaUserCog } from 'react-icons/fa';

const StudentDevelopers = () => {
  // 운영진 정보 배열
  const developers = [
    {
      id: 1,
      name: '손경락',
      role: '프론트엔드 운영진',
      track: 'EduFront1',
      github: 'https://github.com/ganglike248',
      description: '13기 회장',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Liam'
    },
    {
      id: 2,
      name: '서동섭',
      role: '프론트엔드 운영진',
      track: 'EduFront1',
      github: 'https://github.com/dongsubnambuk',
      description: '부회장/홍보부장',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sarah'
    },
    {
      id: 3,
      name: '김진아',
      role: '프론트엔드 운영진',
      track: 'EduFront2',
      github: 'https://github.com/xjina',
      description: '기획부',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ryan'
    },
    {
      id: 4,
      name: '신호철',
      role: '프론트엔드 운영진',
      track: 'EduFront2',
      github: 'https://github.com/slo0ey',
      description: '기획부',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jude'
    },
    {
      id: 5,
      name: '김건환',
      role: '백엔드 운영진',
      track: 'EduBack1',
      github: 'https://github.com/ElroyKR',
      description: '기획부장',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jack'
    },
    {
      id: 6,
      name: '윤도균',
      role: '백엔드 운영진',
      track: 'EduBack1',
      github: 'https://github.com/ehrbs',
      description: '중앙운영단',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina'
    },
    {
      id: 7,
      name: '한동균',
      role: '백엔드 운영진',
      track: 'EduBack2',
      github: 'https://github.com/hdg5639',
      description: '총무',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Kingston'
    },
    {
      id: 8,
      name: '박상우',
      role: '백엔드 운영진',
      track: 'EduBack2',
      github: 'https://github.com/Babsang0826',
      description: '기획부',
      image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia'
    }
  ];

  // 트랙별 색상 및 아이콘 지정
  const getTrackInfo = (track) => {
    switch (track) {
      case 'EduFront1':
        return { color: '#3498db', name: '프론트 교육 1팀', icon: <FaCode /> };
      case 'EduFront2':
        return { color: '#2ecc71', name: '프론트 교육 2팀', icon: <FaCode /> };
      case 'EduBack1':
        return { color: '#e74c3c', name: '백 교육 1팀', icon: <FaLaptopCode /> };
      case 'EduBack2':
        return { color: '#f39c12', name: '백 교육 2팀', icon: <FaLaptopCode /> };
      default:
        return { color: '#95a5a6', name: track, icon: <FaCode /> };
    }
  };

  return (
    <div>
      <h1>운영진 정보</h1>
      <p className="subtitle" style={{ marginTop: '10px', marginBottom: '20px', borderBottom: '1px solid var(--gray)', paddingBottom: '20px', color: '#6c757d' }}>
        계명대학교 멋쟁이사자처럼 13기 운영진을 소개합니다.
      </p>

      <div className="developer-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px', 
        marginBottom: '36px' 
      }}>
        {developers.map((developer) => {
          const trackInfo = getTrackInfo(developer.track);
          
          return (
            <div 
              key={developer.id} 
              className="developer-card" 
              style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--card-radius)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderBottom: `4px solid ${trackInfo.color}`
              }}>
                <img 
                  src={developer.image} 
                  alt={developer.name} 
                  style={{ 
                    width: '100px', 
                    height: '100px',
                    borderRadius: '50%',
                    border: `3px solid ${trackInfo.color}`,
                    backgroundColor: 'white',
                    marginBottom: '16px'
                  }}
                />
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{developer.name}</h2>
                <p style={{ 
                  color: trackInfo.color, 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <FaUserCog /> {developer.role}
                </p>
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  backgroundColor: `${trackInfo.color}20`,
                  color: trackInfo.color,
                  marginTop: '8px'
                }}>
                  {trackInfo.icon} {trackInfo.name}
                </span>
              </div>
              
              <div style={{ 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1
              }}>
                <p style={{ 
                  color: 'var(--text-color)',
                  marginBottom: '20px',
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {developer.description}
                </p>
                
                <a 
                  href={developer.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    marginTop: 'auto'
                  }}
                >
                  <FaGithub /> GitHub 프로필
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDevelopers;