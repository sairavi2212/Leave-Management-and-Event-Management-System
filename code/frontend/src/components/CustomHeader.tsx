import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface CustomHeaderProps {
  title?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  title = "Dashboard"
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-10 w-full h-16 bg-background/80 backdrop-blur-md border-b px-4 lg:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center">
          {/* Added left padding to prevent overlap with sidebar toggle button */}
          <h2 className="text-xl font-semibold pl-10 sm:pl-2">{title}</h2>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
          >
            <HelpCircle size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomHeader;