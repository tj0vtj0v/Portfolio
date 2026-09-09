import {Injectable, inject, signal} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SkeletonLayout} from '../../shared/ui/skeleton/ui-skeleton.component';

export function skeletonLayout(url: string): SkeletonLayout {
    const path = url.split(/[?#]/, 1)[0].replace(/\/$/, '');
    if (path === '/accounting' || path === '/fuel') return path.slice(1) as SkeletonLayout;
    if (/^\/(accounting|fuel)\//.test(path)) {
        return /[?&](mode=add|recordId=)/.test(url) ? 'form' : 'table';
    }
    if (['/account', '/settings', '/login', '/register'].includes(path)) return 'form';
    return 'page';
}

@Injectable({providedIn: 'root'})
export class NavigationLoadingService {
    private readonly router = inject(Router);
    readonly pending = signal<{id: number; layout: SkeletonLayout} | null>(null);

    constructor() {
        this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
            if (event instanceof NavigationStart) {
                // Query-only changes drive existing filters/editors; keep their state visible.
                const path = (url: string) => url.split(/[?#]/, 1)[0];
                this.pending.set(path(event.url) === path(this.router.url) ? null : {id: event.id, layout: skeletonLayout(event.url)});
            } else if (event instanceof NavigationEnd || event instanceof NavigationCancel ||
                event instanceof NavigationError || event instanceof NavigationSkipped) {
                if (this.pending()?.id === event.id) this.pending.set(null);
            }
        });
    }
}
