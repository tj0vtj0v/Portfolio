import {Component} from '@angular/core';
import {UserService} from '../../shared/api/user.service';
import {ModifyUser} from '../../shared/datatype/ModifyUser';
import {ReadUser} from '../../shared/datatype/ReadUser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-account',
    imports: [
        CommonModule,
        FormsModule,
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.css'
})
export class AccountComponent {
    user: ModifyUser = {
        first_name: '',
        last_name: '',
        email: ''
    };
    changePassword: boolean = false;
    repeatPassword?: string = undefined;
    statusMessage: string = '';
    success: boolean = false;

    constructor(
        private userService: UserService
    ) {
    }

    ngOnInit() {
        this.userService.get().subscribe(
            (response: ReadUser) => {
                this.user.first_name = response.first_name;
                this.user.last_name = response.last_name;
                this.user.email = response.email;
            }
        )
    }


    onUpdate(): void {
        if (!this.user.first_name || !this.user.last_name || !this.user.email) {
            this.statusMessage = 'Please do not remove values.';
            return;
        }

        if (this.user.password !== this.repeatPassword) {
            this.statusMessage = 'The passwords have to match.';
            return;
        }

        this.userService.update(this.user).subscribe(
            () => {
                this.statusMessage = 'Edited successfully';
                this.success = true;
                this.resetForm()
            },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        );
    }

    resetForm() {
        this.user.password = undefined
        this.repeatPassword = undefined;

        this.ngOnInit()
    }
}
