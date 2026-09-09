import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FuelSetupState {
    readonly carsEmpty = signal<boolean | null>(null);

    reset(): void { this.carsEmpty.set(null); }
}
