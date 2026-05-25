interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200'
        };
      case 'SHIPPED':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'DELIVERED':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      {status}
    </span>
  );
}