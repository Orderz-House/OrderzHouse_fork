import React, { useEffect } from 'react';
import { themeCSS } from './theme.js';

const AdminTheme = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'adminjs-custom-theme';
    style.textContent = themeCSS;
    
    const existingStyle = document.getElementById('adminjs-custom-theme');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    document.head.appendChild(style);
    
    const enhanceInterface = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (!el.style.transition) {
          el.style.transition = 'all 0.2s ease';
        }
      });

      const sidebarItems = document.querySelectorAll('.adminjs_SidebarNavItem');
      sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateX(4px)';
          item.style.boxShadow = '0 4px 8px 0 rgba(16, 185, 129, 0.15)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.transform = 'translateX(0)';
          item.style.boxShadow = 'none';
        });
      });

      const tables = document.querySelectorAll('.adminjs_Table');
      tables.forEach(table => {
        table.style.opacity = '0';
        table.style.animation = 'fadeInUp 0.6s ease forwards';
      });

      const inputs = document.querySelectorAll('.adminjs_Input, .adminjs_TextArea, .adminjs_Select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
          input.parentElement.style.transform = 'scale(1)';
        });
      });

      const cards = document.querySelectorAll('.adminjs_Box, .adminjs_WrapperBox');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-2px)';
          card.style.boxShadow = '0 8px 16px 0 rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        });
      });
    };

    const animationCSS = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }
      
      .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
      }
      
      .pulse {
        animation: pulse 2s infinite;
      }
      
      .slide-in {
        animation: slideIn 0.3s ease forwards;
      }
    `;

    const animationStyle = document.createElement('style');
    animationStyle.id = 'adminjs-animations';
    animationStyle.textContent = animationCSS;
    
    const existingAnimationStyle = document.getElementById('adminjs-animations');
    if (existingAnimationStyle) {
      document.head.removeChild(existingAnimationStyle);
    }
    
    document.head.appendChild(animationStyle);

    const timeoutId = setTimeout(enhanceInterface, 100);
    
    const observer = new MutationObserver(() => {
      enhanceInterface();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      
      if (document.getElementById('adminjs-custom-theme')) {
        document.head.removeChild(document.getElementById('adminjs-custom-theme'));
      }
      if (document.getElementById('adminjs-animations')) {
        document.head.removeChild(document.getElementById('adminjs-animations'));
      }
    };
  }, []);

  return null; 
};

export default AdminTheme;