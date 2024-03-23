import { cn } from './utils';

const NavigationContainer: React.FC<{
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(`dark:border-dark-800 border-b border-gray-50`, className)}
    >
      {children}
    </div>
  );
};

export default NavigationContainer;
