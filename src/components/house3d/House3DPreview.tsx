import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface Room {
    name: string
    width: number
    length: number
    position: {
        x: number
        y: number
    }
}

interface HouseLayout {
    house_type: string
    style: string
    total_bedrooms: number
    total_bathrooms: number
    rooms: Room[]
    plot_width?: number
    plot_length?: number
    plot_unit?: string
    warnings?: string[]
}

interface Props {
    layout: HouseLayout
    plotWidth?: number
    plotLength?: number
}

type ViewMode = 'top' | '3d'

/* ─────────────────────────────────────────────────────────────
   ROOM COLOUR PALETTE
───────────────────────────────────────────────────────────── */

const ROOM_COLORS: Record<string, { floor: string; wall: string; label: string }> = {
    'living': { floor: '#e8dcc8', wall: '#d4c4a8', label: '🛋' },
    'bedroom': { floor: '#c8d8e8', wall: '#aec4d8', label: '🛏' },
    'kitchen': { floor: '#d8e8c8', wall: '#bcd4a8', label: '🍳' },
    'bathroom': { floor: '#c8e8e8', wall: '#a8d4d8', label: '🚿' },
    'dining': { floor: '#e8d8c8', wall: '#d4c0a8', label: '🍽' },
    'garage': { floor: '#d0d0d0', wall: '#b8b8b8', label: '🚗' },
    'office': { floor: '#d8d0e8', wall: '#c0b4d4', label: '💼' },
    'study': { floor: '#d8d0e8', wall: '#c0b4d4', label: '📚' },
    'laundry': { floor: '#d0e0e8', wall: '#b8ccd4', label: '👔' },
    'hallway': { floor: '#e0dcd4', wall: '#ccc8bc', label: '🚪' },
    'corridor': { floor: '#e0dcd4', wall: '#ccc8bc', label: '🚪' },
    'porch': { floor: '#e0d8c0', wall: '#ccc4a8', label: '🏠' },
    'balcony': { floor: '#d8e0c8', wall: '#c0ccb0', label: '🌿' },
    'closet': { floor: '#ddd8d0', wall: '#c8c0b8', label: '👕' },
    'store': { floor: '#d8d4cc', wall: '#c4bcb0', label: '📦' },
    'default': { floor: '#ddd4c8', wall: '#c8bca8', label: '🏠' },
}

function getRoomColor(name: string) {
    const lower = name.toLowerCase()
    for (const key of Object.keys(ROOM_COLORS)) {
        if (key !== 'default' && lower.includes(key)) {
            return ROOM_COLORS[key]
        }
    }
    return ROOM_COLORS['default']
}

/* ─────────────────────────────────────────────────────────────
   ADJACENCY — detect shared edges for door placement
───────────────────────────────────────────────────────────── */

interface DoorInfo {
    position: [number, number, number]
    rotation: number
    doorWidth: number
}

function findDoors(rooms: Room[]): DoorInfo[] {
    const doors: DoorInfo[] = []
    const tolerance = 0.5

    for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
            const a = rooms[i]
            const b = rooms[j]

            const ax1 = a.position.x, ay1 = a.position.y
            const ax2 = ax1 + a.width, ay2 = ay1 + a.length
            const bx1 = b.position.x, by1 = b.position.y
            const bx2 = bx1 + b.width, by2 = by1 + b.length

            // Check vertical edge adjacency
            const verticalGap = Math.min(Math.abs(ax2 - bx1), Math.abs(bx2 - ax1))
            const yOverlapStart = Math.max(ay1, by1)
            const yOverlapEnd = Math.min(ay2, by2)
            const yOverlap = yOverlapEnd - yOverlapStart

            if (verticalGap <= tolerance && yOverlap > 1.0) {
                const doorX = (ax2 < bx1 + tolerance) ? (ax2 + bx1) / 2 : (bx2 + ax1) / 2
                const doorZ = (yOverlapStart + yOverlapEnd) / 2
                doors.push({
                    position: [doorX, 0.05, doorZ],
                    rotation: 0,
                    doorWidth: Math.min(1.0, yOverlap * 0.4),
                })
                continue
            }

            // Check horizontal edge adjacency
            const horizontalGap = Math.min(Math.abs(ay2 - by1), Math.abs(by2 - ay1))
            const xOverlapStart = Math.max(ax1, bx1)
            const xOverlapEnd = Math.min(ax2, bx2)
            const xOverlap = xOverlapEnd - xOverlapStart

            if (horizontalGap <= tolerance && xOverlap > 1.0) {
                const doorX = (xOverlapStart + xOverlapEnd) / 2
                const doorZ = (ay2 < by1 + tolerance) ? (ay2 + by1) / 2 : (by2 + ay1) / 2
                doors.push({
                    position: [doorX, 0.05, doorZ],
                    rotation: Math.PI / 2,
                    doorWidth: Math.min(1.0, xOverlap * 0.4),
                })
            }
        }
    }
    return doors
}

/* ─────────────────────────────────────────────────────────────
   VALIDATE ROOMS — ensure all rooms have finite numbers
───────────────────────────────────────────────────────────── */

function validateRooms(rooms: Room[]): Room[] {
    return rooms.filter(room => {
        const vals = [room.width, room.length, room.position.x, room.position.y]
        return vals.every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0)
            && room.width > 0 && room.length > 0
    })
}

/* ─────────────────────────────────────────────────────────────
   FURNITURE PLACEHOLDERS
───────────────────────────────────────────────────────────── */

function FurniturePlaceholders({ room }: { room: Room }) {
    const lower = room.name.toLowerCase()
    const cx = room.width / 2

    if (room.width < 2.5 || room.length < 2.5) return null

    if (lower.includes('bedroom')) {
        const bedW = Math.min(1.6, room.width * 0.4)
        const bedL = Math.min(2.0, room.length * 0.45)
        // Position bed near the top wall to avoid center label
        const bedZ = Math.max(bedL / 2 + 0.1, room.length * 0.2)
        return (
            <group>
                <mesh position={[cx, 0.15, bedZ]}>
                    <boxGeometry args={[bedW, 0.3, bedL]} />
                    <meshStandardMaterial color="#7c9cb8" />
                </mesh>
                <mesh position={[cx, 0.32, bedZ - bedL * 0.35]}>
                    <boxGeometry args={[bedW * 0.8, 0.08, 0.35]} />
                    <meshStandardMaterial color="#e8e0d4" />
                </mesh>
            </group>
        )
    }

    if (lower.includes('kitchen')) {
        const counterW = Math.min(room.width * 0.8, room.width - 0.5)
        return (
            <mesh position={[cx, 0.4, 0.4]}>
                <boxGeometry args={[counterW, 0.8, 0.6]} />
                <meshStandardMaterial color="#a0937d" />
            </mesh>
        )
    }

    if (lower.includes('living')) {
        const sofaW = Math.min(2.2, room.width * 0.5)
        // Position sofa near the bottom wall
        const sofaZ = room.length - 0.5
        const tableZ = sofaZ - 0.8
        return (
            <group>
                <mesh position={[cx, 0.2, sofaZ]}>
                    <boxGeometry args={[sofaW, 0.4, 0.8]} />
                    <meshStandardMaterial color="#6b7b8d" />
                </mesh>
                <mesh position={[cx, 0.18, tableZ]}>
                    <boxGeometry args={[0.8, 0.35, 0.5]} />
                    <meshStandardMaterial color="#8a7e6a" />
                </mesh>
            </group>
        )
    }

    if (lower.includes('dining')) {
        // Position dining table off-center
        const tableZ = Math.max(0.6, room.length * 0.25)
        return (
            <mesh position={[cx, 0.3, tableZ]}>
                <boxGeometry args={[1.4, 0.06, 0.9]} />
                <meshStandardMaterial color="#a0937d" />
            </mesh>
        )
    }

    if (lower.includes('bathroom')) {
        return (
            <mesh position={[room.width * 0.3, 0.15, 0.5]}>
                <boxGeometry args={[0.8, 0.3, 0.8]} />
                <meshStandardMaterial color="#b8ccd4" />
            </mesh>
        )
    }

    if (lower.includes('office') || lower.includes('study')) {
        return (
            <mesh position={[cx, 0.3, 0.5]}>
                <boxGeometry args={[1.2, 0.06, 0.6]} />
                <meshStandardMaterial color="#a0937d" />
            </mesh>
        )
    }

    return null
}

/* ─────────────────────────────────────────────────────────────
   DOOR COMPONENT
───────────────────────────────────────────────────────────── */

function DoorOpening({ door }: { door: DoorInfo }) {
    return (
        <group position={door.position} rotation={[0, door.rotation, 0]}>
            {/* Flat threshold on the floor to indicate connectivity without glitching walls */}
            <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[door.doorWidth, 0.02, 0.4]} />
                <meshStandardMaterial color="#8b7355" />
            </mesh>
        </group>
    )
}

/* ─────────────────────────────────────────────────────────────
   ROOM LABEL — Uses Html from Drei (always works, no font loading)
───────────────────────────────────────────────────────────── */

function RoomLabel({ room, isTopView, unit }: { room: Room; isTopView: boolean; unit: string }) {
    const colors = getRoomColor(room.name)
    const fontSize = Math.max(10, Math.min(14, Math.min(room.width, room.length) * 2.5))

    return (
        <Html
            position={[room.width / 2, isTopView ? 0.3 : 0.2, room.length / 2]}
            center
            distanceFactor={isTopView ? undefined : 20}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
            <div style={{
                textAlign: 'center',
                whiteSpace: 'nowrap',
                fontFamily: "'Space Grotesk', sans-serif",
            }}>
                <div style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: 700,
                    color: '#1e293b',
                    textShadow: '0 0 4px rgba(255,255,255,0.8)',
                    lineHeight: 1.2,
                }}>
                    {colors.label} {room.name}
                </div>
                <div style={{
                    fontSize: `${fontSize * 0.7}px`,
                    color: '#5d6d7e',
                    fontWeight: 500,
                    marginTop: '2px',
                }}>
                    {room.width}×{room.length}{unit}
                </div>
            </div>
        </Html>
    )
}

/* ─────────────────────────────────────────────────────────────
   ROOM BLOCK
───────────────────────────────────────────────────────────── */

function RoomBlock({ room, isTopView, unit }: { room: Room; isTopView: boolean; unit: string }) {
    const wallHeight = isTopView ? 0.15 : 2.0
    const wallThickness = 0.1
    const colors = getRoomColor(room.name)

    return (
        <group position={[room.position.x, 0, room.position.y]}>
            {/* Floor */}
            <mesh position={[room.width / 2, 0.02, room.length / 2]} receiveShadow>
                <boxGeometry args={[room.width - 0.02, 0.04, room.length - 0.02]} />
                <meshStandardMaterial color={colors.floor} />
            </mesh>

            {/* Back wall (low Z) */}
            <mesh position={[room.width / 2, wallHeight / 2, wallThickness / 2]} castShadow>
                <boxGeometry args={[room.width, wallHeight, wallThickness]} />
                <meshStandardMaterial
                    color={colors.wall}
                    transparent={!isTopView}
                    opacity={isTopView ? 1 : 0.4}
                />
            </mesh>
            {/* Front wall (high Z) */}
            <mesh position={[room.width / 2, wallHeight / 2, room.length - wallThickness / 2]} castShadow>
                <boxGeometry args={[room.width, wallHeight, wallThickness]} />
                <meshStandardMaterial
                    color={colors.wall}
                    transparent={!isTopView}
                    opacity={isTopView ? 1 : 0.2}
                />
            </mesh>
            {/* Left wall */}
            <mesh position={[wallThickness / 2, wallHeight / 2, room.length / 2]} castShadow>
                <boxGeometry args={[wallThickness, wallHeight, room.length]} />
                <meshStandardMaterial
                    color={colors.wall}
                    transparent={!isTopView}
                    opacity={isTopView ? 1 : 0.3}
                />
            </mesh>
            {/* Right wall */}
            <mesh position={[room.width - wallThickness / 2, wallHeight / 2, room.length / 2]} castShadow>
                <boxGeometry args={[wallThickness, wallHeight, room.length]} />
                <meshStandardMaterial
                    color={colors.wall}
                    transparent={!isTopView}
                    opacity={isTopView ? 1 : 0.25}
                />
            </mesh>

            {/* Room label */}
            <RoomLabel room={room} isTopView={isTopView} unit={unit} />

            {/* Furniture (only in 3D view) */}
            {!isTopView && <FurniturePlaceholders room={room} />}
        </group>
    )
}

/* ─────────────────────────────────────────────────────────────
   PLOT BOUNDARY
───────────────────────────────────────────────────────────── */

function PlotBoundary({ width, length, unit }: { width: number; length: number; unit: string }) {
    const lineColor = '#4a90d9'

    return (
        <group>
            {/* Plot base / ground */}
            <mesh position={[width / 2, -0.02, length / 2]} receiveShadow>
                <boxGeometry args={[width + 0.4, 0.04, length + 0.4]} />
                <meshStandardMaterial color="#f5f0e8" />
            </mesh>

            {/* Border lines */}
            <mesh position={[width / 2, 0.01, -0.05]}>
                <boxGeometry args={[width + 0.2, 0.02, 0.06]} />
                <meshStandardMaterial color={lineColor} />
            </mesh>
            <mesh position={[width / 2, 0.01, length + 0.05]}>
                <boxGeometry args={[width + 0.2, 0.02, 0.06]} />
                <meshStandardMaterial color={lineColor} />
            </mesh>
            <mesh position={[-0.05, 0.01, length / 2]}>
                <boxGeometry args={[0.06, 0.02, length + 0.2]} />
                <meshStandardMaterial color={lineColor} />
            </mesh>
            <mesh position={[width + 0.05, 0.01, length / 2]}>
                <boxGeometry args={[0.06, 0.02, length + 0.2]} />
                <meshStandardMaterial color={lineColor} />
            </mesh>

            {/* Corner markers */}
            {[[0, 0], [width, 0], [0, length], [width, length]].map(([cx, cz], i) => (
                <mesh key={i} position={[cx, 0.03, cz]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color={lineColor} />
                </mesh>
            ))}

            {/* Plot dimension labels using Html */}
            <Html position={[width / 2, 0.1, -1.2]} center>
                <span style={{
                    fontSize: '14px', fontWeight: 700, color: lineColor,
                    fontFamily: "'Space Grotesk', sans-serif",
                    textShadow: '0 0 4px rgba(255,255,255,0.9)',
                    pointerEvents: 'none', userSelect: 'none',
                }}>
                    {width}{unit}
                </span>
            </Html>
            <Html position={[-1.5, 0.1, length / 2]} center>
                <span style={{
                    fontSize: '14px', fontWeight: 700, color: lineColor,
                    fontFamily: "'Space Grotesk', sans-serif",
                    textShadow: '0 0 4px rgba(255,255,255,0.9)',
                    pointerEvents: 'none', userSelect: 'none',
                    writingMode: 'vertical-lr', transform: 'rotate(180deg)',
                }}>
                    {length}{unit}
                </span>
            </Html>
        </group>
    )
}

/* ─────────────────────────────────────────────────────────────
   GROUND GRID
───────────────────────────────────────────────────────────── */

function GroundGrid({ size, centerX, centerZ }: { size: number; centerX: number; centerZ: number }) {
    const gridHelper = useMemo(() => {
        const divisions = Math.max(4, Math.ceil(size))
        const grid = new THREE.GridHelper(size, divisions, '#c0c8d0', '#dde2e8')
        grid.position.set(centerX, -0.01, centerZ)
        return grid
    }, [size, centerX, centerZ])

    return <primitive object={gridHelper} />
}

/* ─────────────────────────────────────────────────────────────
   CAMERA CONTROLLER — uses useEffect (not useMemo!) for side effects
   and smoothly transitions camera via useFrame
───────────────────────────────────────────────────────────── */

interface CameraTarget {
    px: number; py: number; pz: number  // camera position
    tx: number; ty: number; tz: number  // look-at target
}

function CameraController(
    { bounds, viewMode, controlsRef }:
    { bounds: { cx: number; cz: number; maxDim: number }; viewMode: ViewMode; controlsRef: React.RefObject<any> } // eslint-disable-line @typescript-eslint/no-explicit-any
) {
    const { camera } = useThree()
    const targetRef = useRef<CameraTarget | null>(null)

    // Compute the desired camera position whenever viewMode or bounds change
    useEffect(() => {
        const { cx, cz, maxDim } = bounds

        let target: CameraTarget
        if (viewMode === 'top') {
            target = {
                px: cx, py: maxDim * 1.3 + 5, pz: cz + 0.01,
                tx: cx, ty: 0, tz: cz,
            }
        } else {
            target = {
                px: cx + maxDim * 0.7,
                py: maxDim * 0.6,
                pz: cz + maxDim * 0.8,
                tx: cx, ty: 0, tz: cz,
            }
        }
        targetRef.current = target

        // Immediately jump the camera
        camera.position.set(target.px, target.py, target.pz)
        camera.lookAt(target.tx, target.ty, target.tz)
        camera.updateProjectionMatrix()

        // Also update OrbitControls target
        if (controlsRef.current) {
            controlsRef.current.target.set(target.tx, target.ty, target.tz)
            controlsRef.current.update()
        }
    }, [camera, bounds, viewMode, controlsRef])

    return null
}

/* ─────────────────────────────────────────────────────────────
   ERROR BOUNDARY for Canvas children
───────────────────────────────────────────────────────────── */

class CanvasErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props)
        this.state = { hasError: false, error: '' }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message }
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
        return this.props.children
    }
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export default function House3DPreview({ layout, plotWidth, plotLength }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('3d')
    const controlsRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

    // Validate rooms — filter out any with non-finite values
    const validRooms = useMemo(() => validateRooms(layout?.rooms ?? []), [layout?.rooms])

    // Determine plot dimensions
    const pw = layout.plot_width ?? plotWidth ??
        (validRooms.length > 0
            ? Math.max(20, ...validRooms.map(r => r.position.x + r.width)) + 1
            : 20)
    const pl = layout.plot_length ?? plotLength ??
        (validRooms.length > 0
            ? Math.max(20, ...validRooms.map(r => r.position.y + r.length)) + 1
            : 20)

    const displayUnit = layout.plot_unit || 'm'

    const doors = useMemo(() => findDoors(validRooms), [validRooms])

    const houseBounds = useMemo(() => {
        if (validRooms.length === 0) return { cx: pw / 2, cz: pl / 2, maxDim: Math.max(pw, pl) }
        let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity
        validRooms.forEach(r => {
            minX = Math.min(minX, r.position.x)
            minZ = Math.min(minZ, r.position.y)
            maxX = Math.max(maxX, r.position.x + r.width)
            maxZ = Math.max(maxZ, r.position.y + r.length)
        })
        const cx = (minX + maxX) / 2
        const cz = (minZ + maxZ) / 2
        const w = maxX - minX
        const l = maxZ - minZ
        const houseMaxDim = Math.max(w, l, 10)
        const plotMaxDim = Math.max(pw, pl)
        // Frame house with context, capping out at 2.5x house size to prevent excessive shrinking
        const framingMaxDim = Math.max(houseMaxDim * 1.5, Math.min(plotMaxDim, houseMaxDim * 2.5))
        
        return { cx, cz, maxDim: framingMaxDim }
    }, [validRooms, pw, pl])

    const resetCamera = useCallback(() => {
        // We toggle viewMode off and back on to force camera re-setup
        setViewMode(prev => {
            // Force a re-render with the same mode
            const current = prev
            // Directly move OrbitControls and camera
            if (controlsRef.current) {
                const { cx, cz, maxDim } = houseBounds

                controlsRef.current.target.set(cx, 0, cz)

                if (current === 'top') {
                    controlsRef.current.object.position.set(cx, maxDim * 1.3 + 5, cz + 0.01)
                } else {
                    controlsRef.current.object.position.set(
                        cx + maxDim * 0.7, maxDim * 0.6, cz + maxDim * 0.8
                    )
                }
                controlsRef.current.update()
            }
            return current
        })
    }, [houseBounds])

    // No valid rooms
    if (!layout?.rooms?.length) {
        return (
            <div style={styles.emptyState}>
                <span style={{ fontSize: '48px' }}>🏗️</span>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>
                    No room layout available yet.
                </p>
            </div>
        )
    }

    if (validRooms.length === 0) {
        return (
            <div style={styles.emptyState}>
                <span style={{ fontSize: '48px' }}>⚠️</span>
                <p style={{ color: '#f59e0b', fontSize: '14px', marginTop: '12px' }}>
                    Room data is invalid (non-finite coordinates or dimensions).
                </p>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                    Try regenerating the layout.
                </p>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            {/* Control bar */}
            <div style={styles.controlBar}>
                <div style={styles.viewToggle}>
                    <button
                        style={{
                            ...styles.viewBtn,
                            ...(viewMode === '3d' ? styles.viewBtnActive : {}),
                        }}
                        onClick={() => setViewMode('3d')}
                    >
                        🏠 3D View
                    </button>
                    <button
                        style={{
                            ...styles.viewBtn,
                            ...(viewMode === 'top' ? styles.viewBtnActive : {}),
                        }}
                        onClick={() => setViewMode('top')}
                    >
                        📐 Top View
                    </button>
                </div>
                <button style={styles.resetBtn} onClick={resetCamera}>
                    🔄 Reset
                </button>
            </div>

            {/* Warnings */}
            {layout.warnings && layout.warnings.length > 0 && (
                <div style={styles.warningsBar}>
                    {layout.warnings.map((w, i) => (
                        <p key={i} style={styles.warningText}>⚠️ {w}</p>
                    ))}
                </div>
            )}

            {/* 3D Canvas */}
            <div style={styles.canvasWrap}>
                <CanvasErrorBoundary
                    fallback={
                        <div style={{
                            ...styles.emptyState,
                            height: '100%', borderRadius: 0,
                            border: 'none',
                        }}>
                            <span style={{ fontSize: '40px' }}>⚠️</span>
                            <p style={{ color: '#f59e0b', fontSize: '14px', marginTop: '10px' }}>
                                3D rendering error. Try refreshing.
                            </p>
                        </div>
                    }
                >
                    <Canvas
                        shadows
                        camera={{
                            fov: 50,
                            near: 0.1,
                            far: 2000,
                            position: [
                                houseBounds.cx + houseBounds.maxDim * 0.7,
                                houseBounds.maxDim * 0.6,
                                houseBounds.cz + houseBounds.maxDim * 0.8,
                            ],
                        }}
                        gl={{ antialias: true }}
                        style={{ background: '#f0f4f8' }}
                    >
                        <color attach="background" args={['#f0f4f8']} />

                        {/* Camera controller — uses useEffect, not useMemo */}
                        <CameraController
                            bounds={houseBounds}
                            viewMode={viewMode}
                            controlsRef={controlsRef}
                        />

                        {/* Lighting */}
                        <ambientLight intensity={0.9} />
                        <directionalLight
                            position={[pw * 0.8, Math.max(pw, pl) * 0.8, pl * 0.8]}
                            intensity={1.5}
                            castShadow
                        />
                        <directionalLight
                            position={[-pw * 0.3, Math.max(pw, pl) * 0.5, -pl * 0.3]}
                            intensity={0.3}
                        />
                        <hemisphereLight args={['#b1c8e0', '#f5f0e8', 0.5]} />

                        {/* Ground grid */}
                        <GroundGrid
                            size={Math.max(pw, pl) + 4}
                            centerX={pw / 2}
                            centerZ={pl / 2}
                        />

                        {/* Plot boundary */}
                        <PlotBoundary width={pw} length={pl} unit={displayUnit} />

                        {/* Room blocks */}
                        {validRooms.map((room, index) => (
                            <RoomBlock
                                key={`${room.name}-${index}`}
                                room={room}
                                isTopView={viewMode === 'top'}
                                unit={displayUnit}
                            />
                        ))}

                        {/* Doors (only in 3D view) */}
                        {viewMode !== 'top' && doors.map((door, i) => (
                            <DoorOpening key={`door-${i}`} door={door} />
                        ))}

                        {/* Orbit controls */}
                        <OrbitControls
                            ref={controlsRef}
                            makeDefault
                            enableDamping
                            dampingFactor={0.1}
                            minDistance={3}
                            maxDistance={Math.max(pw, pl) * 5}
                            maxPolarAngle={viewMode === 'top' ? 0.1 : Math.PI / 2.1}
                        />
                    </Canvas>
                </CanvasErrorBoundary>
            </div>

            {/* Legend */}
            <div style={styles.legend}>
                <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: '#4a90d9' }} />
                    <span style={styles.legendText}>Plot boundary ({pw}×{pl}{displayUnit})</span>
                </div>
                <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: '#e8dcc8' }} />
                    <span style={styles.legendText}>{validRooms.length} rooms</span>
                </div>
                {layout.house_type && (
                    <div style={styles.legendItem}>
                        <span style={styles.legendText}>
                            🏠 {layout.style} {layout.house_type.replace('_', ' ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
    container: {
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        background: 'rgba(12, 16, 28, 0.95)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    controlBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        background: 'rgba(15, 21, 33, 0.9)',
    },
    viewToggle: {
        display: 'flex',
        gap: '4px',
        background: 'rgba(139, 92, 246, 0.08)',
        borderRadius: '10px',
        padding: '3px',
    },
    viewBtn: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '8px',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Space Grotesk', sans-serif",
        transition: 'all 0.2s',
    },
    viewBtnActive: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
    },
    resetBtn: {
        padding: '8px 14px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        background: 'rgba(139, 92, 246, 0.08)',
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Space Grotesk', sans-serif",
        transition: 'all 0.2s',
    },
    canvasWrap: {
        width: '100%',
        height: '520px',
    },
    warningsBar: {
        padding: '10px 16px',
        background: 'rgba(245, 158, 11, 0.08)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
    },
    warningText: {
        fontSize: '12px',
        color: '#f59e0b',
        margin: '2px 0',
        fontFamily: "'Space Grotesk', sans-serif",
    },
    legend: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '10px 16px',
        borderTop: '1px solid rgba(139, 92, 246, 0.15)',
        background: 'rgba(15, 21, 33, 0.9)',
        flexWrap: 'wrap',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    legendDot: {
        width: '10px',
        height: '10px',
        borderRadius: '3px',
    },
    legendText: {
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: "'Space Grotesk', sans-serif",
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        background: 'rgba(12, 16, 28, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 92, 246, 0.15)',
    },
}
