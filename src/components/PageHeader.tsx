import { useNavigate } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
}

const PageHeader = ({ title, showBack = true, showMenu = true }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/30">
      {showMenu ? (
        <button aria-label="فتح القائمة"><Menu className="w-5 h-5 text-foreground" /></button>
      ) : <div className="w-5" />}
      <h1 className="text-lg font-bold truncate">{title}</h1>
      {showBack ? (
        <button aria-label="رجوع للصفحة السابقة" onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      ) : <div className="w-5" />}
    </div>
  );
};

export default PageHeader;
