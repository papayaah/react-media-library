# Design Document

## Overview

This feature enhances the media library by adding drag-out functionality, allowing users to drag media items from both MediaGrid and RecentMediaGrid components to external applications, editors, or other components. The implementation uses native HTML5 Drag and Drop API with smooth CSS transitions for visual feedback.

The design focuses on:
- Native HTML5 drag and drop for broad compatibility
- Smooth, subtle animations (150-300ms transitions)
- Consistent behavior across MediaGrid and RecentMediaGrid
- Flexibility for developers using third-party DnD libraries
- Non-intrusive visual feedback

## Architecture

### Component Structure

```
MediaGrid / RecentMediaGrid
├── Drag State Management (useState for draggingId)
├── Drag Handlers (handleDragStart, handleDragEnd)
├── GridAssetItem / AssetItem (receives drag props)
│   ├── draggable attribute
│   ├── onDragStart handler
│   ├── onDragEnd handler
│   └── Drag animation styles (opacity, cursor)
└── Optional ItemWrapper (for third-party DnD libraries)
```

### Data Flow

1. User hovers over media item → Cursor changes to `grab`
2. User initiates drag → `onDragStart` fires
   - Set `draggingId` state
   - Configure DataTransfer object with multiple formats
   - Apply opacity animation (0.4)
   - Change cursor to `grabbing`
   - Call optional `onDragStart` callback
3. User drags → Item maintains reduced opacity
4. User drops or cancels → `onDragEnd` fires
   - Clear `draggingId` state
   - Restore opacity (1.0)
   - Restore cursor
   - Call optional `onDragEnd` callback

## Components and Interfaces

### Updated Type Definitions

The `DragDropProps` interface already exists in `types.ts` and includes:

```typescript
export interface DragDropProps {
    draggable?: boolean;
    onDragStart?: (asset: MediaAsset, event: React.DragEvent) => void;
    onDragEnd?: (asset: MediaAsset, event: React.DragEvent) => void;
    itemWrapper?: React.ComponentType<{
        asset: MediaAsset;
        children: React.ReactNode;
    }>;
}
```

### MediaGrid Changes

**Current State:**
- Already has `DragDropProps` in the component signature
- Already has drag handlers implemented (`handleDragStart`, `handleDragEnd`)
- Already tracks `draggingId` state
- Already passes drag props to `GridAssetItem`

**Required Changes:**
- Ensure drag functionality is properly wired in all view modes (grid, list, masonry)
- Add drag support to list view (currently missing)
- Ensure consistent animation timing

### RecentMediaGrid Changes

**Current State:**
- Does NOT have drag functionality
- Uses `AssetItem` component for rendering

**Required Changes:**
- Add `DragDropProps` to component props
- Add `draggingId` state management
- Implement `handleDragStart` and `handleDragEnd` handlers
- Pass drag props to `AssetItem` component
- Update `AssetItem` to accept and handle drag props

### GridAssetItem / AssetItem Updates

Both components need to:
1. Accept drag-related props (draggable, isDragging, onDragStart, onDragEnd)
2. Apply `draggable` attribute conditionally
3. Apply drag animation styles based on `isDragging` state
4. Update cursor styles (grab/grabbing)

## Data Models

### DataTransfer Formats

When a drag operation starts, the system sets multiple data formats for maximum compatibility:

```typescript
// JSON format - for JavaScript applications
e.dataTransfer.setData('application/json', JSON.stringify({
    id: asset.id,
    fileName: asset.fileName,
    fileType: asset.fileType,
    mimeType: asset.mimeType,
    previewUrl: asset.previewUrl,
    size: asset.size,
}));

// URI format - for browsers and applications that accept URLs
if (asset.previewUrl) {
    e.dataTransfer.setData('text/uri-list', asset.previewUrl);
}

// Plain text format - fallback for basic text editors
e.dataTransfer.setData('text/plain', asset.fileName);

// Effect allowed
e.dataTransfer.effectAllowed = 'copyMove';
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Draggable cursor indication

*For any* media item with draggable enabled, the cursor style should be 'grab' when not dragging and 'grabbing' when dragging is active.

**Validates: Requirements 1.1, 2.4**

### Property 2: DataTransfer format completeness

*For any* media asset being dragged, the DataTransfer object should contain all three required formats: 'application/json', 'text/uri-list' (for images), and 'text/plain'.

**Validates: Requirements 1.2, 1.3, 1.5**

### Property 3: Image URL in data transfer

*For any* media asset with fileType 'image' and a previewUrl, the DataTransfer should include the previewUrl in the 'text/uri-list' format.

**Validates: Requirements 1.4**

### Property 4: Drag opacity animation

*For any* media item being dragged, the opacity should be reduced to 0.4 during drag and restored to 1.0 after drag ends.

**Validates: Requirements 2.1, 2.3**

### Property 5: Animation timing constraints

*For any* drag animation, the CSS transition duration should be between 150ms and 300ms inclusive.

**Validates: Requirements 2.5**

### Property 6: Component consistency - visual feedback

*For any* media item in MediaGrid or RecentMediaGrid, the opacity and cursor styles during drag should be identical.

**Validates: Requirements 3.2**

### Property 7: Component consistency - data format

*For any* media asset dragged from MediaGrid or RecentMediaGrid, the DataTransfer formats and content should be identical.

**Validates: Requirements 3.3**

### Property 8: Component consistency - animation timing

*For any* drag operation in MediaGrid or RecentMediaGrid, the transition properties should match.

**Validates: Requirements 3.4**

### Property 9: Drag disable removes handlers

*For any* component with draggable set to false or undefined, no drag-related attributes or event handlers should be attached to media items.

**Validates: Requirements 3.5, 4.3**

### Property 10: Draggable prop controls functionality

*For any* component, setting draggable to true should add the draggable attribute to media items, and setting it to false should not.

**Validates: Requirements 4.1, 4.2**

### Property 11: Callback invocation with correct parameters

*For any* drag operation where onDragStart or onDragEnd callbacks are provided, the callbacks should be invoked with the correct media asset and native drag event.

**Validates: Requirements 4.4, 4.5**

### Property 12: ItemWrapper wraps items

*For any* component with an itemWrapper provided, each media item should be wrapped with the itemWrapper component.

**Validates: Requirements 6.1**

### Property 13: ItemWrapper disables native drag

*For any* component with an itemWrapper provided, the native draggable attribute should not be set on media items.

**Validates: Requirements 6.2**

### Property 14: ItemWrapper receives asset prop

*For any* itemWrapper component, it should receive the media asset as a prop.

**Validates: Requirements 6.3**

### Property 15: Native drag without wrapper

*For any* component without an itemWrapper, the native draggable attribute and drag handlers should be present on media items when draggable is true.

**Validates: Requirements 6.4**

### Property 16: Drag works when selection inactive

*For any* component with selection mode inactive and draggable enabled, drag operations should be allowed.

**Validates: Requirements 7.3**

### Property 17: Selection works when drag disabled

*For any* component with draggable disabled, selection toggle should work correctly.

**Validates: Requirements 7.4**

### Property 18: ARIA attributes for draggable items

*For any* media item with draggable enabled, appropriate ARIA attributes (such as aria-grabbed) should be present.

**Validates: Requirements 8.1**

### Property 19: Focus indication for draggable items

*For any* draggable media item with keyboard focus, visual or ARIA indication should be present.

**Validates: Requirements 8.2**

## Error Handling

### Drag Operation Failures

**Scenario:** DataTransfer API is not available or fails
- **Handling:** Gracefully degrade - log error to console, continue without drag functionality
- **User Impact:** Drag operations won't work, but component remains functional

**Scenario:** Preview URL is invalid or inaccessible
- **Handling:** Omit 'text/uri-list' format, include only JSON and plain text formats
- **User Impact:** Some drop targets may not accept the dragged item

**Scenario:** Callback functions throw errors
- **Handling:** Catch errors, log to console, continue drag operation
- **User Impact:** Custom logic may not execute, but drag completes normally

### Browser Compatibility

**Scenario:** Browser doesn't support HTML5 Drag and Drop
- **Handling:** Feature detection - disable drag functionality if API unavailable
- **User Impact:** Drag operations won't work, but component remains functional

**Scenario:** Browser doesn't support custom drag images
- **Handling:** Skip setDragImage call, use browser default
- **User Impact:** Drag preview may look different, but functionality works

## Testing Strategy

### Unit Testing

Unit tests will cover:

1. **Drag state management**
   - Test that `draggingId` state updates correctly on drag start/end
   - Test that state resets properly after drag completion

2. **DataTransfer format setting**
   - Test that all required formats are set for different asset types
   - Test that image URLs are included for image assets
   - Test that metadata is correctly serialized to JSON

3. **Callback invocation**
   - Test that `onDragStart` and `onDragEnd` callbacks are called
   - Test that callbacks receive correct parameters (asset, event)

4. **Conditional rendering**
   - Test that draggable attribute is added when `draggable` prop is true
   - Test that drag handlers are not attached when `draggable` is false
   - Test that itemWrapper is used when provided

5. **Component integration**
   - Test that MediaGrid passes drag props to GridAssetItem
   - Test that RecentMediaGrid passes drag props to AssetItem

### Property-Based Testing

Property-based tests will verify universal behaviors across all inputs using a PBT library (fast-check for JavaScript/TypeScript). Each test will run a minimum of 100 iterations.

1. **Property 1: Draggable cursor indication**
   - Generate random media assets
   - Verify cursor style is 'grab' when not dragging
   - Verify cursor style is 'grabbing' when isDragging is true
   - **Feature: drag-out-media, Property 1: Draggable cursor indication**

2. **Property 2: DataTransfer format completeness**
   - Generate random media assets
   - Simulate drag start
   - Verify DataTransfer contains all required formats
   - **Feature: drag-out-media, Property 2: DataTransfer format completeness**

3. **Property 3: Image URL in data transfer**
   - Generate random image assets with previewUrls
   - Simulate drag start
   - Verify 'text/uri-list' contains the previewUrl
   - **Feature: drag-out-media, Property 3: Image URL in data transfer**

4. **Property 4: Drag opacity animation**
   - Generate random media assets
   - Verify opacity is 0.4 when isDragging is true
   - Verify opacity is 1.0 when isDragging is false
   - **Feature: drag-out-media, Property 4: Drag opacity animation**

5. **Property 5: Animation timing constraints**
   - Generate random media items
   - Extract transition duration from styles
   - Verify duration is between 150ms and 300ms
   - **Feature: drag-out-media, Property 5: Animation timing constraints**

6. **Property 6: Component consistency - visual feedback**
   - Generate random media assets
   - Render in both MediaGrid and RecentMediaGrid
   - Verify opacity and cursor styles match
   - **Feature: drag-out-media, Property 6: Component consistency - visual feedback**

7. **Property 7: Component consistency - data format**
   - Generate random media assets
   - Simulate drag from both components
   - Verify DataTransfer formats are identical
   - **Feature: drag-out-media, Property 7: Component consistency - data format**

8. **Property 10: Draggable prop controls functionality**
   - Generate random draggable prop values (true/false/undefined)
   - Verify draggable attribute presence matches prop value
   - **Feature: drag-out-media, Property 10: Draggable prop controls functionality**

9. **Property 11: Callback invocation with correct parameters**
   - Generate random media assets
   - Provide mock callbacks
   - Simulate drag operations
   - Verify callbacks are called with correct asset and event
   - **Feature: drag-out-media, Property 11: Callback invocation with correct parameters**

10. **Property 13: ItemWrapper disables native drag**
    - Generate random itemWrapper components
    - Verify native draggable attribute is not set when wrapper is provided
    - **Feature: drag-out-media, Property 13: ItemWrapper disables native drag**

### Integration Testing

Integration tests will verify:

1. **End-to-end drag operations**
   - User initiates drag on media item
   - Visual feedback appears (opacity, cursor)
   - DataTransfer is populated correctly
   - Drag completes and state resets

2. **Cross-component consistency**
   - Drag behavior is identical in MediaGrid and RecentMediaGrid
   - Data formats match across components

3. **Interaction with selection mode**
   - Selection mode doesn't interfere with drag
   - Drag doesn't interfere with selection

4. **Third-party DnD library integration**
   - itemWrapper works with react-dnd
   - itemWrapper works with dnd-kit

## Implementation Notes

### Animation Performance

- Use CSS transitions instead of JavaScript animations for better performance
- Use `will-change: opacity` hint for browsers to optimize rendering
- Keep transition durations short (150-300ms) for responsive feel

### Browser Compatibility

- HTML5 Drag and Drop is supported in all modern browsers
- Custom drag images may not work in all browsers (graceful degradation)
- DataTransfer.setData() format support varies - use multiple formats for compatibility

### Accessibility Considerations

- Add `aria-grabbed` attribute to indicate drag state
- Ensure keyboard users can still interact with media items
- Provide visual focus indicators for keyboard navigation
- Consider adding keyboard shortcuts for drag operations in future iterations

### Performance Considerations

- Avoid re-rendering all items when one item is being dragged
- Use React.memo or useMemo for expensive computations
- Debounce drag state updates if performance issues arise
- Lazy load preview images to reduce memory usage during drag

### Future Enhancements

- Custom drag ghost images with better styling
- Multi-item drag support (drag multiple selected items)
- Drag-to-reorder within the library
- Keyboard-based drag operations for accessibility
- Touch device support for mobile drag operations
