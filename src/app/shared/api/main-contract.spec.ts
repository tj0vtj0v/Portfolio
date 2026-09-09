import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {authInterceptor} from '../../core/auth/auth.interceptor';
import {AccountingService} from './accounting.service';
import {FuelService} from './fuel.service';
import {UserService} from './user.service';

// Expected wire format taken from main (612679b), independently of API_BASE_URL.
describe('backend contract compatibility with main', () => {
    let backend: HttpTestingController;
    let stored: Array<string | null>;
    beforeEach(() => {
        stored = [localStorage.getItem('token'), localStorage.getItem('token-type')];
        localStorage.setItem('token', 'contract-token');
        localStorage.setItem('token-type', 'Bearer');
        TestBed.configureTestingModule({providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]});
        backend = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        backend.verify();
        ['token', 'token-type'].forEach((key, index) => {
            if (stored[index] === null) localStorage.removeItem(key);
            else localStorage.setItem(key, stored[index]!);
        });
    });

    function expectRequest(method: string, suffix: string, body?: unknown) {
        const request = backend.expectOne(`${window.location.origin}/api/${suffix}`);
        expect(request.request.method).toBe(method);
        expect(request.request.headers.get('Authorization')).toBe('Bearer contract-token');
        expect(request.request.headers.get('accept')).toBe(method === 'DELETE' ? '*/*' : 'application/json');
        if (body !== undefined) {
            expect(request.request.headers.get('Content-Type')).toBe('application/json');
            expect(request.request.body).toEqual(body);
        }
        request.flush(method === 'GET' ? [] : {});
    }

    it('preserves Accounting entity payloads, raw names and CRUD methods', () => {
        const service = TestBed.inject(AccountingService);
        const account = {id: 2, name: 'Main savings & travel', balance: 100};
        const category = {id: 3, name: 'Daily expenses & food'};
        for (const [entity, value] of [['account', account], ['category', category]] as const) {
            const collection = entity === 'account' ? 'accounts' : 'categories';
            (service as any)[`add_${entity}`](value).subscribe();
            expectRequest('POST', `accounting/${collection}`, value);
            (service as any)[`update_${entity}`](value.name, value).subscribe();
            expectRequest('PATCH', `accounting/${collection}/${value.name}`, value);
            (service as any)[`delete_${entity}`](value.name).subscribe();
            expectRequest('DELETE', `accounting/${collection}/${value.name}`);
        }
        service.get_account_history(account.name).subscribe();
        expectRequest('GET', `accounting/accounts/${account.name}/history`);
        for (const entity of ['expense', 'income', 'transfer']) {
            const value = {id: 7, date: '2026-09-08', amount: 12.5, reason: 'A & B', account, category, source: account, target: {id: 4}};
            const expected = entity === 'transfer'
                ? {date: value.date, amount: 12.5, source_id: 2, target_id: 4}
                : {date: value.date, reason: value.reason, amount: 12.5, account_id: 2, ...(entity === 'expense' ? {category_id: 3} : {})};
            (service as any)[`add_${entity}`](value).subscribe();
            expectRequest('POST', `accounting/${entity}s`, expected);
            (service as any)[`update_${entity}`](value).subscribe();
            expectRequest('PATCH', `accounting/${entity}s/7`, expected);
            (service as any)[`delete_${entity}`](7).subscribe();
            expectRequest('DELETE', `accounting/${entity}s/7`);
        }
    });

    it('preserves Fuel payloads, raw vehicle names and CRUD methods', () => {
        const service = TestBed.inject(FuelService);
        const car = {id: 2, name: 'Car & trailer', usage_start: '2026-01-01'};
        service.add_car(car).subscribe();
        expectRequest('POST', 'fuel/cars', car);
        service.update_car(car.name, car).subscribe();
        expectRequest('PATCH', `fuel/cars/${car.name}`, car);
        service.delete_car(car.name).subscribe();
        expectRequest('DELETE', `fuel/cars/${car.name}`);
        const refuel = {id: 8, date: '2026-09-08', distance: 400, consumption: 25.5, cost: 40.5, car, fuel_type: {id: '3', name: 'Petrol'}};
        const expected = {date: refuel.date, distance: 400, consumption: 25.5, cost: 40.5, car_id: 2, fuel_type_id: '3'};
        service.add_refuel(refuel).subscribe();
        expectRequest('POST', 'fuel/refuels', expected);
        service.update_refuel(refuel).subscribe();
        expectRequest('PATCH', 'fuel/refuels/8', expected);
        service.delete_refuel(8).subscribe();
        expectRequest('DELETE', 'fuel/refuels/8');
    });

    it('preserves registration and profile request formats', () => {
        const service = TestBed.inject(UserService);
        const user = {username: 'fixture', first_name: 'A', last_name: 'B', email: 'fixture@example.test', password: 'test-only'};
        service.register(user).subscribe();
        expectRequest('POST', 'users', user);
        const profile = {first_name: 'A', last_name: 'B', email: 'fixture@example.test'};
        service.update(profile).subscribe();
        expectRequest('PATCH', 'users/me', profile);
        service.get().subscribe();
        expectRequest('GET', 'users/me');
        service.delete().subscribe();
        expectRequest('DELETE', 'users/me');
    });
});
