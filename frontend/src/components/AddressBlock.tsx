interface AddressBlockProps {
  address: string;
}

export default function AddressBlock({ address }: AddressBlockProps) {
  // Split address into lines for better formatting
  const addressLines = address.split(',').map(line => line.trim());

  return (
    <div className="text-sm text-gray-600">
      {addressLines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
}