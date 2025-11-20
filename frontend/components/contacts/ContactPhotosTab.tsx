'use client';

interface ContactPhotosTabProps {
  contactId: string;
}

export default function ContactPhotosTab({ contactId }: ContactPhotosTabProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
      </div>
      <div className="px-6 py-12 text-center text-gray-500">
        <p>Photo management coming soon...</p>
      </div>
    </div>
  );
}

