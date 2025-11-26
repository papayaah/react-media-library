import React, { useRef, useEffect, useState } from 'react';
import { Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Undo, Hand, Crop } from 'lucide-react';

interface ImageEditorProps {
    src: string;
    onSave: (blob: Blob) => void;
    onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
    const canvasRef = useRef<any>(null);
    const selectionRef = useRef<any>(null);
    const imageRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    const [mode, setMode] = useState<'crop' | 'pan'>('crop');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const rotationRef = useRef(0);

    useEffect(() => {
        // Dynamically import cropperjs only when this component is mounted
        import('cropperjs').then(() => {
            setIsReady(true);
        }).catch(err => {
            console.error("Failed to load cropperjs", err);
        });
    }, []);

    const updatePreview = async () => {
        if (!isReady || !selectionRef.current || !previewCanvasRef.current) return;

        try {
            // Use the selection element to get the cropped canvas
            const canvas = await selectionRef.current.$toCanvas({
                width: 300, // Limit preview size for performance
                height: 300,
            });

            const ctx = previewCanvasRef.current?.getContext('2d');
            if (ctx && canvas) {
                previewCanvasRef.current.width = canvas.width;
                previewCanvasRef.current.height = canvas.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(canvas, 0, 0);
            }
        } catch (e) {
            // Ignore errors during fast interaction
        }
    };

    // Update preview when interacting
    useEffect(() => {
        if (!isReady || !canvasRef.current) return;

        const element = canvasRef.current;
        // Listen to specific cropper events for real-time updates
        element.addEventListener('change', updatePreview);
        element.addEventListener('action', updatePreview); // 'action' might be the event for dragging

        // Initial update
        setTimeout(updatePreview, 500);

        return () => {
            element.removeEventListener('change', updatePreview);
            element.removeEventListener('action', updatePreview);
        };
    }, [isReady]);

    const handleSave = async () => {
        if (selectionRef.current) {
            try {
                // IMPORTANT: Call $toCanvas on the SELECTION element to get the cropped area
                const canvas = await selectionRef.current.$toCanvas();
                canvas.toBlob((blob: Blob | null) => {
                    if (blob) {
                        onSave(blob);
                    }
                }, 'image/png');
            } catch (error) {
                console.error('Failed to crop image:', error);
            }
        }
    };

    const handleRotate = (degree: number, absolute = false) => {
        if (imageRef.current) {
            let newRotation = rotationRef.current;

            if (absolute) {
                newRotation = degree;
            } else {
                newRotation = newRotation + degree;
            }

            // Normalize to 0-360
            newRotation = newRotation % 360;
            if (newRotation < 0) newRotation += 360;

            // Calculate diff to apply to the cropper
            // The cropper accumulates rotation, so we need to pass the difference
            // BUT, if we are setting absolute rotation, we might need to reset and rotate?
            // Or just keep track of current rotation and rotate by difference.
            const diff = newRotation - rotationRef.current;

            if (diff !== 0) {
                imageRef.current.$rotate(diff);
                rotationRef.current = newRotation;
                setRotation(newRotation);
                setIsDirty(true);
                // Force preview update after rotation
                setTimeout(updatePreview, 50);
            }
        }
    };

    const snapRotate = (direction: 'left' | 'right') => {
        const current = rotationRef.current;
        let target;

        if (direction === 'right') {
            // Next 90 degree mark
            target = (Math.floor(current / 90) + 1) * 90;
        } else {
            // Previous 90 degree mark
            target = (Math.ceil(current / 90) - 1) * 90;
        }

        // Normalize target to 0-360 before passing
        target = target % 360;
        if (target < 0) target += 360;

        handleRotate(target, true);
    };

    const handleFlip = (axis: 'x' | 'y') => {
        if (imageRef.current) {
            if (axis === 'x') {
                const newScale = scaleX * -1;
                setScaleX(newScale);
                imageRef.current.$scale(newScale, scaleY);
            } else {
                const newScale = scaleY * -1;
                setScaleY(newScale);
                imageRef.current.$scale(scaleX, newScale);
            }
            setIsDirty(true);
        }
    };

    const handleZoom = (ratio: number) => {
        if (imageRef.current) {
            imageRef.current.$zoom(ratio);
            setIsDirty(true);
        }
    };

    const handleReset = () => {
        if (imageRef.current) {
            imageRef.current.$reset();
            setScaleX(1);
            setScaleY(1);
        }
        if (selectionRef.current) {
            selectionRef.current.hidden = true;
        }
        setIsDirty(false);
    };

    const onInteract = () => {
        if (!isDirty) setIsDirty(true);
        // Also update preview on any interaction
        updatePreview();
    };

    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    const presets = [
        { label: 'Free', value: null, icon: <Crop size={20} /> },
        { label: '1:1', value: 1, icon: <div className="border-2 border-white w-5 h-5 rounded-sm" /> },
        { label: '9:16', value: 9 / 16, icon: <div className="border-2 border-white w-3 h-5 rounded-sm" /> },
        { label: '16:9', value: 16 / 9, icon: <div className="border-2 border-white w-5 h-3 rounded-sm" /> },
        { label: '4:5', value: 4 / 5, icon: <div className="border-2 border-white w-4 h-5 rounded-sm" /> },
        { label: '5:4', value: 5 / 4, icon: <div className="border-2 border-white w-5 h-4 rounded-sm" /> },
        { label: '3:4', value: 3 / 4, icon: <div className="border-2 border-white w-3 h-4 rounded-sm" /> },
        { label: '4:3', value: 4 / 3, icon: <div className="border-2 border-white w-4 h-3 rounded-sm" /> },
    ];

    const handleAspectRatio = (ratio: number | null) => {
        setAspectRatio(ratio);
        setMode('crop');

        // Reset selection to center with new aspect ratio
        if (selectionRef.current && imageRef.current) {
            const imageRect = imageRef.current.getBoundingClientRect();
            // We can't easily get the exact image dimensions from the web component ref directly in a standard way 
            // without querying the internal cropper instance, but we can try to reset the selection.

            // A simple way is to reset the selection to center
            selectionRef.current.$center();
        }
    };

    // When aspect ratio changes, we want to ensure the selection is valid and visible
    useEffect(() => {
        if (selectionRef.current && isReady) {
            // This forces the selection to re-evaluate its constraints
            selectionRef.current.aspectRatio = aspectRatio;
            if (aspectRatio) {
                // If we have a specific ratio, try to maximize the selection or center it
                // The web component API for this is a bit experimental, but $center() usually works
                setTimeout(() => {
                    selectionRef.current?.$center();
                }, 10);
            }
        }
    }, [aspectRatio, isReady]);

    // Joystick/Dial Component
    const RotationJoystick = () => {
        const dialRef = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [dragRotation, setDragRotation] = useState(rotation);

        // Sync drag rotation with actual rotation when not dragging
        useEffect(() => {
            if (!isDragging) {
                setDragRotation(rotation);
            }
        }, [rotation, isDragging]);

        const updateAngle = (clientX: number, clientY: number) => {
            if (!dialRef.current) return;
            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const x = clientX - centerX;
            const y = clientY - centerY;

            // Calculate angle from positive X axis (Right is 0)
            let angleRad = Math.atan2(y, x);
            let angleDeg = angleRad * (180 / Math.PI);

            // Convert to Clockwise from Top (Top is 0)
            // atan2: Right=0, Bottom=90, Left=180, Top=-90
            // We want: Top=0, Right=90, Bottom=180, Left=270

            angleDeg += 90;

            // Normalize to 0-360
            if (angleDeg < 0) angleDeg += 360;
            if (angleDeg >= 360) angleDeg -= 360;

            setDragRotation(angleDeg);
            handleRotate(angleDeg, true);
        };

        useEffect(() => {
            const onMove = (e: MouseEvent) => {
                if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    updateAngle(e.clientX, e.clientY);
                }
            };

            const onUp = () => {
                setIsDragging(false);
                document.body.style.cursor = '';
            };

            if (isDragging) {
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                document.body.style.cursor = 'grabbing';
            }

            return () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor = '';
            };
        }, [isDragging]);

        const handleMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            // Immediate update on click
            updateAngle(e.clientX, e.clientY);
        };

        // Calculate knob position based on rotation
        const radius = 24; // Distance from center
        const displayRotation = isDragging ? dragRotation : rotation;

        // Convert displayRotation (Top=0) back to trig angle (Right=0) for positioning
        // Top(0) -> -90
        // Right(90) -> 0
        const angleRad = (displayRotation - 90) * (Math.PI / 180);
        const knobX = Math.cos(angleRad) * radius;
        const knobY = Math.sin(angleRad) * radius;

        return (
            <div
                className="relative w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10 transition-colors touch-none select-none"
                ref={dialRef}
                onMouseDown={handleMouseDown}
            >
                {/* Center dot */}
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full absolute" />

                {/* Line from center to knob */}
                <div
                    className="absolute h-0.5 bg-blue-500/50 origin-left pointer-events-none"
                    style={{
                        width: '24px',
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${displayRotation - 90}deg)`
                    }}
                />

                {/* Knob */}
                <div
                    className={`w-4 h-4 rounded-full absolute shadow-lg border border-white/20 transition-transform duration-75 ${isDragging ? 'bg-blue-400 scale-110' : 'bg-blue-500'}`}
                    style={{
                        transform: `translate(${knobX}px, ${knobY}px)`
                    }}
                />

                {/* Markers */}
                <div className="absolute top-1 w-0.5 h-1.5 bg-white/20" />
                <div className="absolute bottom-1 w-0.5 h-1.5 bg-white/20" />
                <div className="absolute left-1 w-1.5 h-0.5 bg-white/20" />
                <div className="absolute right-1 w-1.5 h-0.5 bg-white/20" />
            </div>
        );
    };

    if (!isReady) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-black text-white">
                Loading editor...
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex">
            {/* Left Sidebar - Expanded */}
            <div className="w-72 bg-neutral-900 border-r border-white/10 flex flex-col z-50 h-full">

                {/* Preview Section */}
                <div className="p-4 border-b border-white/10 shrink-0">
                    <span className="text-xs font-medium text-gray-400 mb-3 block uppercase tracking-wider">Preview</span>
                    <div className="w-full aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdzNOs8b5z-VR1X84w7Fk88_fET23_ugb17acQ=')] opacity-5 bg-center bg-cover"></div>
                        <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain relative z-10" />
                    </div>
                </div>

                {/* Rotation Section */}
                <div className="p-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rotation</span>
                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{Math.round(rotation)}°</span>
                    </div>

                    <div className="flex items-center gap-4 justify-center">
                        <button onClick={() => snapRotate('left')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <RotateCcw size={16} />
                        </button>

                        <RotationJoystick />

                        <button onClick={() => snapRotate('right')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <RotateCw size={16} />
                        </button>
                    </div>
                </div>

                {/* Presets Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    <span className="text-xs font-medium text-gray-400 mb-3 block uppercase tracking-wider">Crop Presets</span>
                    <div className="grid grid-cols-3 gap-2">
                        {presets.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => handleAspectRatio(preset.value)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${aspectRatio === preset.value
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                title={preset.label}
                            >
                                {preset.icon}
                                <span className="text-[10px] font-medium">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Top Bar */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 rounded-full text-white transition-colors text-sm font-medium backdrop-blur-md"
                    >
                        Cancel
                    </button>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors text-sm font-medium shadow-lg animate-in fade-in zoom-in duration-200 flex items-center gap-2"
                        >
                            <Check size={16} />
                            Save
                        </button>
                    )}
                </div>

                {/* Main Editor */}
                <div className="flex-1 w-full h-full overflow-hidden bg-neutral-950 relative">
                    <cropper-canvas
                        ref={canvasRef}
                        background
                        style={{ width: '100%', height: '100%' }}
                        onAction={onInteract}
                        onChange={onInteract}
                    >
                        <cropper-image
                            ref={imageRef}
                            src={src}
                            alt="Edit"
                            rotatable
                            scalable
                            skewable
                            translatable
                        ></cropper-image>
                        <cropper-shade hidden></cropper-shade>

                        {mode === 'crop' && (
                            <cropper-handle action="select" plain></cropper-handle>
                        )}
                        {mode === 'pan' && (
                            <cropper-handle action="move" plain></cropper-handle>
                        )}

                        <cropper-selection
                            id="cropper-selection"
                            ref={selectionRef}
                            key={aspectRatio || 'free'}
                            movable
                            resizable
                            aspect-ratio={aspectRatio}
                            initial-coverage="0.9"
                        >
                            <cropper-grid role="grid" covered></cropper-grid>
                            <cropper-crosshair centered></cropper-crosshair>
                            <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
                            <cropper-handle action="n-resize"></cropper-handle>
                            <cropper-handle action="e-resize"></cropper-handle>
                            <cropper-handle action="s-resize"></cropper-handle>
                            <cropper-handle action="w-resize"></cropper-handle>
                            <cropper-handle action="ne-resize"></cropper-handle>
                            <cropper-handle action="nw-resize"></cropper-handle>
                            <cropper-handle action="se-resize"></cropper-handle>
                            <cropper-handle action="sw-resize"></cropper-handle>
                        </cropper-selection>
                    </cropper-canvas>
                </div>

                {/* Bottom Toolbar - Simplified since we moved rotation */}
                <div className="h-16 bg-neutral-900 border-t border-white/10 flex items-center justify-center gap-4 px-4 z-50">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setMode('pan')}
                            className={`p-2 rounded text-white transition-colors ${mode === 'pan' ? 'bg-blue-500' : 'hover:bg-white/10'}`}
                            title="Pan Mode"
                        >
                            <Hand size={18} />
                        </button>
                        <button
                            onClick={() => setMode('crop')}
                            className={`p-2 rounded text-white transition-colors ${mode === 'crop' ? 'bg-blue-500' : 'hover:bg-white/10'}`}
                            title="Crop Mode"
                        >
                            <Crop size={18} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button onClick={() => handleFlip('x')} className="p-2 hover:bg-white/10 rounded text-white" title="Flip Horizontal">
                            <FlipHorizontal size={18} />
                        </button>
                        <button onClick={() => handleFlip('y')} className="p-2 hover:bg-white/10 rounded text-white" title="Flip Vertical">
                            <FlipVertical size={18} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-white/10 rounded text-white" title="Zoom In">
                            <ZoomIn size={18} />
                        </button>
                        <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-white/10 rounded text-white" title="Zoom Out">
                            <ZoomOut size={18} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <button onClick={handleReset} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded text-white transition-colors" title="Reset">
                        <Undo size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
