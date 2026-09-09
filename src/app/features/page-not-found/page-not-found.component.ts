import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {UserService} from '../../shared/api/user.service';
import {UiEmptyStateComponent} from '../../shared/ui/empty-state/ui-empty-state.component';

@Component({
    selector: 'app-page-not-found',
    imports: [RouterLink, UiEmptyStateComponent],
    templateUrl: './page-not-found.component.html',
    styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
    constructor(protected readonly userService: UserService) {}
}
