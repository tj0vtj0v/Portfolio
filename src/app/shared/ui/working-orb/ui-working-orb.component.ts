import {DOCUMENT} from '@angular/common';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {ThemeService} from '../../../core/theme/theme.service';

interface OrbNode {
    x: number;
    y: number;
    z: number;
}

interface ProjectedNode extends OrbNode {
    px: number;
    py: number;
    depth: number;
}

/** Angular-native Connecting orb adaptation for the application loading overlay. */
@Component({
    selector: 'app-ui-working-orb',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ui-working-orb.component.html',
    styleUrl: './ui-working-orb.component.css'
})
export class UiWorkingOrbComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input({transform: booleanAttribute}) visible = false;
    @ViewChild('overlay', {static: true}) private readonly overlay?: ElementRef<HTMLElement>;
    @ViewChild('canvas', {static: true}) private readonly canvas?: ElementRef<HTMLCanvasElement>;

    private readonly nodes = UiWorkingOrbComponent.createNodes(28);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly theme = inject(ThemeService);
    private animationFrame = 0;
    private drawing = false;

    ngAfterViewInit(): void {
        if (this.visible) this.start();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['visible']) return;
        this.setScrollLock(this.visible);
        if (this.visible) this.start();
        else this.stop();
    }

    ngOnDestroy(): void {
        this.setScrollLock(false);
        this.stop();
    }

    private setScrollLock(locked: boolean): void {
        const html = this.document.documentElement;
        if (locked) this.renderer.addClass(html, 'ui-loading-lock');
        else this.renderer.removeClass(html, 'ui-loading-lock');
    }

    private start(): void {
        if (!this.canvas || this.drawing) return;
        this.drawing = true;
        const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            this.draw(0);
            return;
        }
        const loop = (time: number) => {
            if (!this.visible) {
                this.drawing = false;
                this.animationFrame = 0;
                return;
            }
            this.draw(time / 1000);
            this.animationFrame = requestAnimationFrame(loop);
        };
        this.animationFrame = requestAnimationFrame(loop);
    }

    private stop(): void {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.animationFrame = 0;
        this.drawing = false;
    }

    private draw(time: number): void {
        const canvas = this.canvas?.nativeElement;
        if (!canvas) return;
        this.positionOverlay();
        const size = 72;
        const dpr = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
        if (canvas.width !== Math.round(size * dpr) || canvas.height !== Math.round(size * dpr)) {
            canvas.width = Math.round(size * dpr);
            canvas.height = Math.round(size * dpr);
        }
        const context = canvas.getContext('2d');
        if (!context) return;
        const dark = this.theme.theme() === 'dark';
        const nodeInk = dark ? '255, 255, 255' : '36, 36, 36';
        const lineInk = dark ? '255, 255, 255' : '36, 36, 36';
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, size, size);

        const center = size / 2;
        const radius = size * 0.4;
        const yaw = time * 0.12;
        const tilt = 0.32;
        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);
        const sinTilt = Math.sin(tilt);
        const cosTilt = Math.cos(tilt);
        const projected = this.nodes.map((node, index): ProjectedNode => {
            const drift = 0.06 * Math.sin(time * 0.24 + index * 1.7);
            const x = node.x + drift * Math.cos(index * 2.4);
            const y = node.y + drift * Math.sin(index * 1.8);
            const z = node.z + drift * Math.cos(index * 1.2);
            const length = Math.hypot(x, y, z);
            const nx = x / length;
            const ny = y / length;
            const nz = z / length;
            const rotatedX = nx * cosYaw + nz * sinYaw;
            const rotatedZ = -nx * sinYaw + nz * cosYaw;
            const rotatedY = ny * cosTilt - rotatedZ * sinTilt;
            const depth = rotatedY * sinTilt + rotatedZ * cosTilt;
            return {x: nx, y: ny, z: nz, px: center + rotatedX * radius, py: center - rotatedY * radius, depth,};
        });

        const threshold = 0.72;
        context.lineCap = 'round';
        for (let i = 0; i < projected.length; i++) {
            for (let j = i + 1; j < projected.length; j++) {
                const first = projected[i];
                const second = projected[j];
                const distance = Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
                if (distance >= threshold) continue;
                const depth = (first.depth + second.depth + 2) / 4;
                const proximity = 1 - distance / threshold;
                const alpha = Math.min(0.84, (dark ? 4 * proximity : 2.5) * proximity * (0.2 + 0.52 * depth));
                context.strokeStyle = `rgba(${lineInk}, ${alpha})`;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(first.px, first.py);
                context.lineTo(second.px, second.py);
                context.stroke();
            }
        }

        for (const node of [...projected].sort((first, second) => first.depth - second.depth)) {
            const depth = (node.depth + 1) / 2;
            const pulse = 1 + 0.22 * Math.sin(time * 1.4 + node.px * 2.7);
            context.fillStyle = `rgba(${nodeInk}, ${0.25 + 0.7 * depth})`;
            context.beginPath();
            context.arc(node.px, node.py, (0.55 + 0.8 * depth) * pulse, 0, Math.PI * 2);
            context.fill();
        }

        for (let signal = 0; signal < 5; signal++) {
            const segment = Math.floor(time * 0.55 + signal * 7.31);
            const firstIndex = Math.floor(UiWorkingOrbComponent.hash(segment, signal * 3.1 + 1.7) * projected.length);
            let secondIndex = Math.floor(UiWorkingOrbComponent.hash(segment, signal * 5.7 + 4.2) * projected.length);
            if (firstIndex === secondIndex) secondIndex = (secondIndex + 1) % projected.length;
            const fraction = UiWorkingOrbComponent.fraction(time * 0.55 + signal * 7.31);
            const first = projected[firstIndex];
            const second = projected[secondIndex];
            const x = first.px + (second.px - first.px) * fraction;
            const y = first.py + (second.py - first.py) * fraction;
            context.fillStyle = `rgba(${nodeInk}, .95)`;
            context.beginPath();
            context.arc(x, y, 1.2, 0, Math.PI * 2);
            context.fill();
        }
    }

    private positionOverlay(): void {
        if (typeof window === 'undefined') return;
        const overlay = this.overlay?.nativeElement;
        const main = this.host.closest('main');
        if (!overlay || !main) return;
        const mainRect = main.getBoundingClientRect();
        const header = this.document.querySelector('app-header');
        const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
        const top = Math.max(mainRect.top, headerBottom, 0);
        const bottom = Math.min(mainRect.bottom, window.innerHeight);
        const left = Math.max(mainRect.left, 0);
        const right = Math.min(mainRect.right, window.innerWidth);
        this.renderer.setStyle(overlay, 'top', `${top}px`);
        this.renderer.setStyle(overlay, 'left', `${left}px`);
        this.renderer.setStyle(overlay, 'width', `${Math.max(0, right - left)}px`);
        this.renderer.setStyle(overlay, 'height', `${Math.max(0, bottom - top)}px`);
    }

    private static createNodes(count: number): OrbNode[] {
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        return Array.from({length: count}, (_, index) => {
            const y = 1 - (2 * (index + 0.5)) / count;
            const radial = Math.sqrt(1 - y * y);
            const angle = index * goldenAngle;
            return {x: radial * Math.cos(angle), y, z: radial * Math.sin(angle)};
        });
    }

    private static hash(first: number, second: number): number {
        const value = Math.sin(first * 12.9898 + second * 78.233) * 43758.5453;
        return value - Math.floor(value);
    }

    private static fraction(value: number): number {
        return value - Math.floor(value);
    }
}
