import { MediaLibraryProvider } from '../../src/components/MediaLibraryProvider';
import { MediaGrid } from '../../src/components/MediaGrid';
import { tailwindPreset } from '../../src/presets/tailwind';
import {
  Image,
  Video,
  Music,
  FileText,
  File,
  Upload,
  Search,
  Trash2,
} from 'lucide-react';
import './App.css';

const icons = {
  upload: <Upload size={24} />,
  search: <Search size={20} />,
  trash: <Trash2 size={18} />,
  photo: <Image size={48} opacity={0.5} />,
  video: <Video size={48} />,
  audio: <Music size={48} />,
  document: <FileText size={48} />,
  file: <File size={48} />,
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <MediaLibraryProvider enableDragDrop={true}>
          <MediaGrid
            preset={tailwindPreset}
            icons={icons}
          />
        </MediaLibraryProvider>
      </div>
    </div>
  );
}

export default App;
