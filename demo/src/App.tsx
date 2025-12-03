import { MediaLibraryProvider, MediaGrid, tailwindPreset, lucideIcons } from '@reactkits.dev/react-media-library';
import './App.css';

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <MediaLibraryProvider enableDragDrop={true}>
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
