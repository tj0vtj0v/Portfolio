import {computed, Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class RequestLoadingService {
    private readonly requestCount = signal(0);
    readonly active = computed(() => this.requestCount() > 0);

    begin(): void {
        this.requestCount.update(count => count + 1);
    }

    end(): void {
        this.requestCount.update(count => Math.max(0, count - 1));
    }
}
