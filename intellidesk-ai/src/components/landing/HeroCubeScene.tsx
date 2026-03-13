'use client';
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ───────────────────────── ENERGY CORE ───────────────────────── */

function EnergyCore() {
	const coreRef = useRef<THREE.Mesh>(null!);
	const glowRef = useRef<THREE.Mesh>(null!);
	const auraRef = useRef<THREE.Mesh>(null!);

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		const pulse = Math.sin(t * 1.5);
		coreRef.current.scale.setScalar(1 + pulse * 0.04);
		glowRef.current.scale.setScalar(1 + pulse * 0.08);
		auraRef.current.scale.setScalar(1 + pulse * 0.12);
		(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
			2 + pulse * 0.4;
	});

	return (
		<group>
			<mesh ref={coreRef}>
				<sphereGeometry args={[0.55, 64, 64]} />
				<meshStandardMaterial
					color="#1738ff"
					emissive="#1738ff"
					emissiveIntensity={2}
					roughness={0.3}
					metalness={0}
				/>
			</mesh>
			<mesh ref={glowRef}>
				<sphereGeometry args={[0.8, 64, 64]} />
				<meshStandardMaterial
					color="#1738ff"
					emissive="#1738ff"
					emissiveIntensity={1}
					transparent
					opacity={0.25}
					depthWrite={false}
				/>
			</mesh>
			<mesh ref={auraRef}>
				<sphereGeometry args={[1.2, 64, 64]} />
				<meshStandardMaterial
					color="#1738ff"
					emissive="#1738ff"
					emissiveIntensity={0.4}
					transparent
					opacity={0.08}
					depthWrite={false}
				/>
			</mesh>
			<pointLight color="#1738ff" intensity={18} distance={6} decay={2} />
		</group>
	);
}

/* ───────────────────────── PREMIUM CUBE GRID + HOVER PUSH ───────────────────────── */

interface CubeData {
	pos: [number, number, number];
	dir: THREE.Vector3;
}

function CubeGrid() {
	const groupRef = useRef<THREE.Group>(null!);
	const meshRefs = useRef<THREE.Mesh[]>([]);
	const { camera } = useThree();

	const cubeData = useMemo<CubeData[]>(() => {
		const data: CubeData[] = [];
		const offset = 1.05;
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					if (x === 0 && y === 0 && z === 0) continue;
					data.push({
						pos: [x * offset, y * offset, z * offset],
						dir: new THREE.Vector3(x, y, z).normalize(),
					});
				}
			}
		}
		return data;
	}, []);

	const raycaster = useMemo(() => new THREE.Raycaster(), []);
	const targets = useRef<THREE.Vector3[]>(
		cubeData.map((d) => new THREE.Vector3(...d.pos)),
	);

	useFrame((state) => {
		const t = state.clock.getElapsedTime();

		// Group rotation from newtest.html
		groupRef.current.rotation.y = t * 0.25;
		groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;

		// Hover push interaction
		raycaster.setFromCamera(state.pointer, camera);
		const meshes = meshRefs.current.filter(Boolean);
		const intersects = raycaster.intersectObjects(meshes);

		cubeData.forEach((d, i) => {
			targets.current[i].set(...d.pos);
		});

		if (intersects.length > 0) {
			const idx = meshes.indexOf(intersects[0].object as THREE.Mesh);
			if (idx >= 0) {
				const push = cubeData[idx].dir.clone().multiplyScalar(0.5);
				targets.current[idx].set(...cubeData[idx].pos).add(push);
			}
		}

		meshes.forEach((mesh, i) => {
			mesh.position.lerp(targets.current[i], 0.12);
		});
	});

	return (
		<group ref={groupRef}>
			{cubeData.map((d, i) => (
				<RoundedBox
					key={i}
					ref={(el: THREE.Mesh) => {
						if (el) meshRefs.current[i] = el;
					}}
					args={[1, 1, 1]}
					radius={0.08}
					smoothness={4}
					position={d.pos}
				>
					<meshPhysicalMaterial
						color="#0a0a0a"
						metalness={0.9}
						roughness={0.35}
						clearcoat={0.9}
						clearcoatRoughness={0.05}
						envMapIntensity={2.2}
					/>
				</RoundedBox>
			))}
		</group>
	);
}

/* ───────────────────────── PARTICLES ───────────────────────── */

function Particles() {
	const ref = useRef<THREE.Points>(null!);

	const { positions, velocities } = useMemo(() => {
		const count = 35;
		const spread = 6;
		const pos = new Float32Array(count * 3);
		const vel: number[] = [];
		for (let i = 0; i < count; i++) {
			pos[i * 3] = (Math.random() - 0.5) * spread * 2;
			pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 2;
			pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
			vel.push(
				(Math.random() - 0.5) * 0.003,
				(Math.random() - 0.5) * 0.003,
				(Math.random() - 0.5) * 0.003,
			);
		}
		return { positions: pos, velocities: vel };
	}, []);

	useFrame(() => {
		const arr = ref.current.geometry.attributes.position.array as Float32Array;
		const count = arr.length / 3;
		const spread = 6;
		for (let i = 0; i < count; i++) {
			arr[i * 3] += velocities[i * 3];
			arr[i * 3 + 1] += velocities[i * 3 + 1];
			arr[i * 3 + 2] += velocities[i * 3 + 2];
			for (let a = 0; a < 3; a++) {
				if (Math.abs(arr[i * 3 + a]) > spread) {
					arr[i * 3 + a] *= -0.9;
				}
			}
		}
		ref.current.geometry.attributes.position.needsUpdate = true;
	});

	return (
		<points ref={ref}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					args={[positions, 3]}
				/>
			</bufferGeometry>
			<pointsMaterial
				color="#1738ff"
				size={0.04}
				transparent
				opacity={0.35}
				depthWrite={false}
				sizeAttenuation
				toneMapped={false}
			/>
		</points>
	);
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export default function HeroCubeScene({
	className = "",
}: {
	className?: string;
}) {
	return (
		<div className={className} style={{ cursor: "grab" }}>
			<Canvas
				camera={{ position: [3.4, 2.2, 6.8], fov: 43 }}
				dpr={[1, 2]}
				gl={{
					antialias: true,
					alpha: true,
					toneMapping: THREE.ACESFilmicToneMapping,
					toneMappingExposure: 1.1,
				}}
				style={{ background: "transparent" }}
				onPointerDown={(e) => {
					(e.target as HTMLElement).style.cursor = "grabbing";
				}}
				onPointerUp={(e) => {
					(e.target as HTMLElement).style.cursor = "grab";
				}}
			>
				{/* Studio lighting — 3 directional + ambient (from newtest.html) */}
				<directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
				<directionalLight position={[-4, 3, 2]} intensity={2} color="#ffffff" />
				<directionalLight
					position={[0, -5, 5]}
					intensity={1.5}
					color="#ffffff"
				/>
				<ambientLight color="#ffffff" intensity={0.25} />

				{/* RoomEnvironment at 0.04 */}
				<Environment preset="apartment" environmentIntensity={0.04} />

				{/* OrbitControls */}
				<OrbitControls
					enableZoom={false}
					enablePan={false}
					autoRotate
					autoRotateSpeed={0.4}
				/>

				<EnergyCore />
				<CubeGrid />
				<Particles />
			</Canvas>
		</div>
	);
}
