# Implementation Plan

- [ ] 1. Update RecentMediaGrid component with drag functionality
  - Add drag state management (draggingId)
  - Implement handleDragStart and handleDragEnd handlers
  - Pass drag props to AssetItem component
  - Add DragDropProps to component interface
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 4.1_

- [ ]* 1.1 Write property test for RecentMediaGrid drag state
  - **Property 4: Drag opacity animation**
  - **Validates: Requirements 2.1, 2.3**

- [ ] 2. Update AssetItem component to support drag operations
  - Accept drag-related props (draggable, isDragging, onDragStart, onDragEnd)
  - Apply draggable attribute conditionally
  - Implement drag animation styles (opacity, cursor, transitions)
  - Ensure hover state works with drag state
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for AssetItem drag animations
  - **Property 1: Draggable cursor indication**
  - **Validates: Requirements 1.1, 2.4**

- [ ]* 2.2 Write property test for animation timing
  - **Property 5: Animation timing constraints**
  - **Validates: Requirements 2.5**

- [ ] 3. Enhance MediaGrid drag implementation
  - Verify drag functionality works in all view modes (grid, list, masonry)
  - Add drag support to list view
  - Ensure consistent animation timing across all views
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 3.1 Write property test for MediaGrid drag consistency
  - **Property 6: Component consistency - visual feedback**
  - **Validates: Requirements 3.2**

- [ ] 4. Implement DataTransfer format handling
  - Set application/json format with full asset metadata
  - Set text/uri-list format for image assets with previewUrl
  - Set text/plain format with fileName
  - Set effectAllowed to 'copyMove'
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ]* 4.1 Write property test for DataTransfer formats
  - **Property 2: DataTransfer format completeness**
  - **Validates: Requirements 1.2, 1.3, 1.5**

- [ ]* 4.2 Write property test for image URL in DataTransfer
  - **Property 3: Image URL in data transfer**
  - **Validates: Requirements 1.4**

- [ ] 5. Add drag callback support
  - Ensure onDragStart callback is invoked with asset and event
  - Ensure onDragEnd callback is invoked with asset and event
  - Add error handling for callback exceptions
  - _Requirements: 4.4, 4.5_

- [ ]* 5.1 Write property test for callback invocation
  - **Property 11: Callback invocation with correct parameters**
  - **Validates: Requirements 4.4, 4.5**

- [ ] 6. Implement itemWrapper support
  - Conditionally disable native drag when itemWrapper is provided
  - Pass asset prop to itemWrapper component
  - Ensure itemWrapper works in both MediaGrid and RecentMediaGrid
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 6.1 Write property test for itemWrapper behavior
  - **Property 13: ItemWrapper disables native drag**
  - **Validates: Requirements 6.2**

- [ ]* 6.2 Write property test for itemWrapper asset prop
  - **Property 14: ItemWrapper receives asset prop**
  - **Validates: Requirements 6.3**

- [ ] 7. Add conditional drag enable/disable logic
  - Verify draggable prop controls drag functionality
  - Ensure drag handlers are not attached when draggable is false
  - Remove visual indicators when drag is disabled
  - _Requirements: 3.5, 4.1, 4.2, 4.3_

- [ ]* 7.1 Write property test for drag enable/disable
  - **Property 10: Draggable prop controls functionality**
  - **Validates: Requirements 4.1, 4.2**

- [ ]* 7.2 Write property test for handler removal
  - **Property 9: Drag disable removes handlers**
  - **Validates: Requirements 3.5, 4.3**

- [ ] 8. Ensure drag and selection mode compatibility
  - Verify selection mode doesn't interfere with drag
  - Verify drag doesn't interfere with selection
  - Test interaction between both features
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 8.1 Write unit test for selection and drag interaction
  - Test that selection works when drag is disabled
  - Test that drag works when selection is inactive
  - _Requirements: 7.3, 7.4_

- [ ] 9. Add accessibility attributes
  - Add aria-grabbed attribute to draggable items
  - Add focus indicators for keyboard navigation
  - Ensure draggable items are keyboard accessible
  - _Requirements: 8.1, 8.2_

- [ ]* 9.1 Write property test for ARIA attributes
  - **Property 18: ARIA attributes for draggable items**
  - **Validates: Requirements 8.1**

- [ ] 10. Add error handling and browser compatibility
  - Add feature detection for Drag and Drop API
  - Handle DataTransfer API failures gracefully
  - Add error handling for callback exceptions
  - Log errors to console for debugging
  - _Requirements: All (error handling)_

- [ ]* 10.1 Write unit tests for error scenarios
  - Test behavior when DataTransfer API is unavailable
  - Test behavior when callbacks throw errors
  - Test behavior with invalid preview URLs
  - _Requirements: All (error handling)_

- [ ] 11. Update component exports and documentation
  - Ensure DragDropProps is exported from types.ts
  - Update component prop types to include drag props
  - Add JSDoc comments for drag-related props
  - _Requirements: All_

- [ ] 12. Cross-component consistency verification
  - Verify MediaGrid and RecentMediaGrid have identical drag behavior
  - Verify DataTransfer formats match across components
  - Verify animation timing is consistent
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 12.1 Write property test for cross-component consistency
  - **Property 7: Component consistency - data format**
  - **Validates: Requirements 3.3**

- [ ]* 12.2 Write property test for animation consistency
  - **Property 8: Component consistency - animation timing**
  - **Validates: Requirements 3.4**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
