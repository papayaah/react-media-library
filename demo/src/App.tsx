import { MediaLibraryProvider, MediaGrid, tailwindPreset, lucideIcons } from '@buzzer/media-library';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <MediaLibraryProvider enableDragDrop={true}>
          <MediaGrid
            preset={tailwindPreset}
            icons={lucideIcons}
          />
        </MediaLibraryProvider>
      </div>
    </div>
  );
}

export default App;
