import { MediaLibraryProvider, MediaGrid, tailwindPreset, lucideIcons } from '@reactkits.dev/react-media-library';
import type { MediaPexelsProvider } from '@reactkits.dev/react-media-library';
import { useMemo } from 'react';
import './App.css';

const mockPexelsProvider: MediaPexelsProvider = {
  async fetchImages() {
    // Mock Pexels images for demo
    return [
      {
        name: 'pexels-demo-1.jpg',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        size: 123456,
        modified: Date.now() - 86400000,
      },
      {
        name: 'pexels-demo-2.jpg',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
        size: 234567,
        modified: Date.now() - 172800000,
      },
      {
        name: 'pexels-demo-3.jpg',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
        size: 345678,
        modified: Date.now() - 259200000,
      },
      {
        name: 'pexels-demo-4.jpg',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
        size: 456789,
        modified: Date.now() - 345600000,
      },
      {
        name: 'pexels-demo-5.jpg',
        url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop',
        size: 567890,
        modified: Date.now() - 432000000,
      },
      {
        name: 'pexels-demo-6.jpg',
        url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
        size: 678901,
        modified: Date.now() - 518400000,
      },
    ];
  },
};

function App() {
  const pexels = useMemo(() => mockPexelsProvider, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <MediaLibraryProvider enableDragDrop={true} pexels={pexels}>
          <MediaGrid
            preset={tailwindPreset}
            icons={lucideIcons}
          />
        </MediaLibraryProvider>
      </div>
    </main>
  );
}

export default App;
