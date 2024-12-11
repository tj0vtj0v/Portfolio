import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {AuthenticationComponent} from '../authentication/authentication.component';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-private',
    imports: [
        AuthenticationComponent,
        NgIf
    ],
    templateUrl: './private.component.html',
    styleUrl: './private.component.css'
})
export class PrivateComponent {
    constructor(protected authenticationService: AuthenticationService) {
    }


}
